import { lookupArchive } from "@subsquid/archive-registry";
import { Store, TypeormDatabase } from "@subsquid/typeorm-store";
import {
  BatchContext,
  BatchProcessorItem,
  decodeHex,
  EvmLogEvent,
  SubstrateBatchProcessor,
  SubstrateBlock,
  toHex,
} from "@subsquid/substrate-processor";
import { In } from "typeorm";
import { ethers } from "ethers";
import { contractAddress, getContractEntity, MULTICALL_CONTRACT } from "./contract";
import { Owner, Token, Transfer } from "./model";
import * as dps from "./abi/dps";
import { EvmLog, getEvmLog } from "@subsquid/frontier";
import { BalancesTransferEvent } from "./types/events";
import { Event } from "./types/support";
import { getAddress } from "@ethersproject/address";
import { BalancesAccountStorage } from "./types/storage";
import { Multicall } from "./abi/multicall";

const database = new TypeormDatabase();

const processor = new SubstrateBatchProcessor()
  .setDataSource({
    // FIXME: set RPC_ENDPOINT secret when deploying to Aquarium
    //        See https://docs.subsquid.io/deploy-squid/env-variables/
    chain: process.env.RPC_ENDPOINT || "wss://wss.api.moonbeam.network",
    archive: lookupArchive("moonbeam", {type: "Substrate"}),
  })
  // .addEvent('Balances.Transfer', {
  //   data: {
  //     event: {
  //       args: true,
  //       extrinsic: {
  //         hash: true,
  //         fee: true,
  //       },
  //     },
  //   },
  // } as const)
  .addEvmLog(contractAddress, {
    filter: [[
      dps.events.Transfer.topic
    ]], 
  });

type Item = BatchProcessorItem<typeof processor>;
export type Context = BatchContext<Store, Item>;

processor.run(database, async (ctx) => {
  const transfersData: TransferData[] = [];
  const balancesData: BalanceData[] = [];

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.name === "EVM.Log") {
        // EVM log extracted from the substrate event
        const evmLog = getEvmLog(ctx, item.event)
        const transfer = handleTransfer(block.header, item.event, evmLog);
        transfersData.push(transfer);
      }
      // if (item.name === "Balances.Transfer") {
      //   let e = new BalancesTransferEvent(ctx, item.event);
      //   let balanceTransfer: { from: Uint8Array; to: Uint8Array; amount: bigint };
      //   if (e.isV900) {
      //     let [from, to, amount] = e.asV900;
      //     balanceTransfer = { from, to, amount };
      //   } else if (e.isV1201) {
      //   balanceTransfer = e.asV1201;
      //   }  else {
      //     throw new Error("Unsupported spec");
      //   }
      //   const balance: BalanceData = {
      //     id: item.event.id,
      //     from: getAddress(toHex(balanceTransfer.from)),
      //     to: getAddress(toHex(balanceTransfer.to)),
      //     timestamp: BigInt(block.header.timestamp),
      //     amount: balanceTransfer.amount,
      //     block: block.header.height,
      //     transactionHash: item.event.extrinsic?.hash || "",
      //   };
      //   balancesData.push(balance);
      // }
    }
  }

  await saveTransfers(ctx, transfersData, balancesData);
});


type BalanceData = {
  id: string;
  from: string;
  to: string;
  amount: bigint;
  timestamp: bigint;
  block: number;
  transactionHash: string;
};

type TransferData = {
  id: string;
  from: string;
  to: string;
  token: ethers.BigNumber;
  timestamp: bigint;
  block: number;
  transactionHash: string;
};

function handleTransfer(
  block: SubstrateBlock,
  event: EvmLogEvent,
  evmLog: EvmLog
): TransferData {
  const { from, to, tokenId } = dps.events.Transfer.decode(evmLog);

  const transfer: TransferData = {
    id: event.id,
    token: tokenId,
    from,
    to,
    timestamp: BigInt(block.timestamp),
    block: block.height,
    transactionHash: event.evmTxHash,
  };

  return transfer;
}

async function saveTransfers(ctx: Context, transfersData: TransferData[], balancesData: BalanceData[]) {
  const tokensIds: Set<string> = new Set();
  const ownersIds: Set<string> = new Set();

  for (const transferData of transfersData) {
    tokensIds.add(transferData.token.toString());
    ownersIds.add(transferData.from);
    ownersIds.add(transferData.to);
  }

  for (const balanceData of balancesData) {
    ownersIds.add(balanceData.from);
    ownersIds.add(balanceData.to);
  }

  const transfers: Set<Transfer> = new Set();

  const tokens: Map<string, Token> = new Map(
    (await ctx.store.findBy(Token, { id: In([...tokensIds]) })).map((token) => [
      token.id,
      token,
    ])
  );

  const owners: Map<string, Owner> = new Map(
    (await ctx.store.findBy(Owner, { id: In([...ownersIds]) })).map((owner) => [
      owner.id,
      owner,
    ])
  );
  
  if (process.env.RPC_ENDPOINT == undefined) {
    ctx.log.warn(`RPC_ENDPOINT env variable is not set`)
  }

  const accountsData = await getAccountBalances(ctx, ownersIds);
  ctx.log.info("Fetched account balance data")

  // for (const balanceData of balancesData) {
  //   let from = owners.get(balanceData.from);
  //   if (from == null) {
  //     from = new Owner({ id: balanceData.from, balance: 0n });
  //     owners.set(from.id, from);
  //   }
  //   from.balance -= balanceData.amount

  //   let to = owners.get(balanceData.to);
  //   if (to == null) {
  //     to = new Owner({ id: balanceData.to, balance: 0n });
  //     owners.set(to.id, to);
  //   }
  //   to.balance += balanceData.amount
  // }

  for (const transferData of transfersData) {
    const contract = new dps.Contract(
      ctx,
      { height: transferData.block },
      contractAddress
    );

    let from = owners.get(transferData.from);
    if (from == null) {
      from = new Owner({ id: transferData.from, balance: 0n });
      owners.set(from.id, from);
    }
    from.balance = accountsData.get(from.id) || 0n

    let to = owners.get(transferData.to);
    if (to == null) {
      to = new Owner({ id: transferData.to, balance: 0n });
      owners.set(to.id, to);
    }
    to.balance = accountsData.get(to.id) || 0n

    const tokenId = transferData.token.toString();

    let token = tokens.get(tokenId);
    if (token == null) {
      token = new Token({
        id: tokenId,
        // FIXME: use multicall here to batch
        //        contract calls and speed up indexing
        uri: "", // await contract.tokenURI(transferData.token),
        contract: await getContractEntity(ctx),
      });
      tokens.set(token.id, token);
    }
    token.owner = to;

    const { id, block, transactionHash, timestamp } = transferData;

    const transfer = new Transfer({
      id,
      block,
      timestamp,
      transactionHash,
      from,
      to,
      token,
    });

    transfers.add(transfer);
  }

  const maxHeight = Math.max(...transfersData.map(o => o.block)); 
  // query the multicall contract at the max height of the chunk
  const multicall = new Multicall(ctx, {height: maxHeight}, MULTICALL_CONTRACT)

  ctx.log.info(`Calling mutlicall for ${transfersData.length} tokens...`)
  // call in pages of size 100
  const results = await multicall.tryAggregate(dps.functions.tokenURI, transfersData.map(t => [contractAddress, [t.token]] as [string, any[]]), 100);

  results.forEach((res: any, i: number) => {
      let t = tokens.get(transfersData[i].token.toString());
      if (t) {
          let uri = '';
          if (res.success) {
              uri = <string>res.value;
          } else if (res.returnData) {
              uri = <string>dps.functions.tokenURI.tryDecodeResult(res.returnData) || '';
          }
          t.uri = uri;
      }
  });
  ctx.log.info(`Done`);

  await ctx.store.save([...owners.values()]);
  await ctx.store.save([...tokens.values()]);
  await ctx.store.save([...transfers]);
}

async function getAccountBalances(ctx: Context, ownersIds: Set<string>) {
  const storage = new BalancesAccountStorage(ctx, ctx.blocks[ctx.blocks.length -1].header);
  const ownerAddresses = [...ownersIds]
  const ownerUintArrays = ownerAddresses.map((x) => new Uint8Array(decodeHex(x)));
  const accountsData = await storage.asV900.getMany(ownerUintArrays);

  return new Map(ownerAddresses.map((v, i) => [v, accountsData[i].free]))
}
