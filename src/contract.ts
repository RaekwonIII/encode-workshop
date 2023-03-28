import { Store } from "@subsquid/typeorm-store";
import { Contract } from "./model";
import { Contract as ContractAPI } from "./abi/dps";
import { BigNumber } from "ethers";
import { Context } from "./processor";

export const contractAddress = "0x224AcB257f1E95Fe310E1ab9BB402C579bC5eeAE";
export const MULTICALL_CONTRACT='0x6477204E12A7236b9619385ea453F370aD897bb2'

export async function createContractEntity(ctx: Context): Promise<Contract> {
  const lastBlock = ctx.blocks[ctx.blocks.length -1].header
  const contractAPI = new ContractAPI({...ctx, block: lastBlock}, contractAddress);
  let name = "", symbol = "", totalSupply = BigNumber.from(0);
  try {
    name = await contractAPI.name();
    symbol = await contractAPI.symbol();
    totalSupply = await contractAPI.totalSupply();
  } catch (error) {
    ctx.log.warn(`[API] Error while fetching Contract metadata for address ${contractAddress}`);
    if (error instanceof Error) {
      ctx.log.warn(`${error.message}`);
    }
  }
  return new Contract({
    id: contractAddress,
    name: name,
    symbol: symbol,
    totalSupply: totalSupply.toBigInt(),
  });
}

let contractEntity: Contract | undefined;

export async function getContractEntity(ctx: Context): Promise<Contract> {
  if (contractEntity == null) {
    contractEntity = await ctx.store.get(Contract, contractAddress);
    if (contractEntity == null) {
      contractEntity = await createContractEntity(ctx);
      await ctx.store.insert(contractEntity);
    }
  }
  return contractEntity;
}
