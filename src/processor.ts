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
import { Owner, Transfer } from "./model";
import * as usdt from "./abi/usdt";
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
  .addEvent('Balances.Transfer', {
    data: {
      event: {
        args: true,
        extrinsic: {
          hash: true,
          fee: true,
        },
      },
    },
  } as const)
  .addEvmLog(contractAddress, {
    filter: [[
      usdt.events.Transfer.topic
    ]], 
  });

type Item = BatchProcessorItem<typeof processor>;
export type Context = BatchContext<Store, Item>;

processor.run(database, async (ctx) => {
  const transfersData: TransferData[] = [];

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.name === "EVM.Log") {
        // EVM log extracted from the substrate event
        const evmLog = getEvmLog(ctx, item.event)
        const transfer = handleTransfer(block.header, item.event, evmLog);
        transfersData.push(transfer);
      }
      if (item.name === "Balances.Transfer") {
        let e = new BalancesTransferEvent(ctx, item.event);
        let balanceTransfer: { from: Uint8Array; to: Uint8Array; amount: bigint };
        if (e.isV900) {
          let [from, to, amount] = e.asV900;
          balanceTransfer = { from, to, amount };
        } else if (e.isV1201) {
        balanceTransfer = e.asV1201;
        }  else {
          throw new Error("Unsupported spec");
        }
        transfersData.push({
          id: item.event.id,
          from: getAddress(toHex(balanceTransfer.from)),
          to: getAddress(toHex(balanceTransfer.to)),
          timestamp: BigInt(block.header.timestamp),
          amountGLMR: balanceTransfer.amount,
          block: block.header.height,
          transactionHash: item.event.extrinsic?.hash || "",
        });
      }
    }
  }

  await saveTransfers(ctx, transfersData);
});

type TransferData = {
  id: string;
  from: string;
  to: string;
  amountUSDT?: bigint;
  amountGLMR?: bigint;
  timestamp: bigint;
  block: number;
  transactionHash: string;
};

function handleTransfer(
  block: SubstrateBlock,
  event: EvmLogEvent,
  evmLog: EvmLog
): TransferData {
  const { from, to, value } = usdt.events.Transfer.decode(evmLog);

  const transfer: TransferData = {
    id: event.id,
    amountUSDT: value.toBigInt(),
    from,
    to,
    timestamp: BigInt(block.timestamp),
    block: block.height,
    transactionHash: event.evmTxHash,
  };

  return transfer;
}

async function saveTransfers(ctx: Context, transfersData: TransferData[]) {
  const ownersIds: Set<string> = new Set();

  for (const transferData of transfersData) {
    ownersIds.add(transferData.from);
    ownersIds.add(transferData.to);
  }

  const transfers: Set<Transfer> = new Set();

  const owners: Map<string, Owner> = new Map(
    (await ctx.store.findBy(Owner, { id: In([...ownersIds]) })).map((owner) => [
      owner.id,
      owner,
    ])
  );
  
  if (process.env.RPC_ENDPOINT == undefined) {
    ctx.log.warn(`RPC_ENDPOINT env variable is not set`)
  }

  for (const transferData of transfersData) {

    let from = owners.get(transferData.from);
    if (from == null) {
      from = new Owner({ id: transferData.from, balanceGLMR: 0n, balanceUSDT: 0n });
      owners.set(from.id, from);
    }
    from.balanceGLMR -= transferData.amountGLMR || 0n;
    from.balanceUSDT -= transferData.amountUSDT || 0n;

    let to = owners.get(transferData.to);
    if (to == null) {
      to = new Owner({ id: transferData.to, balanceGLMR: 0n, balanceUSDT: 0n });
      owners.set(to.id, to);
    }
    to.balanceGLMR += transferData.amountGLMR || 0n;
    to.balanceUSDT += transferData.amountUSDT || 0n;

    const { id, block, transactionHash, timestamp, amountGLMR, amountUSDT } = transferData;

    const transfer = new Transfer({
      id,
      block,
      timestamp,
      transactionHash,
      from,
      to,
      amountGLMR: amountGLMR || 0n,
      amountUSDT: amountUSDT || 0n,
    });

    transfers.add(transfer);
  }

  await ctx.store.save([...owners.values()]);
  await ctx.store.save([...transfers]);
}