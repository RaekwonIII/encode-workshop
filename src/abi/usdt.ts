import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './usdt.abi'

export const abi = new ethers.utils.Interface(ABI_JSON);

export const events = {
    Approval: new LogEvent<([owner: string, spender: string, value: ethers.BigNumber] & {owner: string, spender: string, value: ethers.BigNumber})>(
        abi, '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
    ),
    LogAddAuth: new LogEvent<([auth: string, timestamp: ethers.BigNumber] & {auth: string, timestamp: ethers.BigNumber})>(
        abi, '0xff9be4a5a0b9027fd253167d4c170ef1bbf8403af21bf06a0ed87ac8c8ecb5c6'
    ),
    LogChangeMPCOwner: new LogEvent<([oldOwner: string, newOwner: string, effectiveHeight: ethers.BigNumber] & {oldOwner: string, newOwner: string, effectiveHeight: ethers.BigNumber})>(
        abi, '0x1d065115f314fb9bad9557bd5460b9e3c66f7223b1dd04e73e828f0bb5afe89f'
    ),
    LogChangeVault: new LogEvent<([oldVault: string, newVault: string, effectiveTime: ethers.BigNumber] & {oldVault: string, newVault: string, effectiveTime: ethers.BigNumber})>(
        abi, '0x5c364079e7102c27c608f9b237c735a1b7bfa0b67f27c2ad26bad447bf965cac'
    ),
    LogSwapin: new LogEvent<([txhash: string, account: string, amount: ethers.BigNumber] & {txhash: string, account: string, amount: ethers.BigNumber})>(
        abi, '0x05d0634fe981be85c22e2942a880821b70095d84e152c3ea3c17a4e4250d9d61'
    ),
    LogSwapout: new LogEvent<([account: string, bindaddr: string, amount: ethers.BigNumber] & {account: string, bindaddr: string, amount: ethers.BigNumber})>(
        abi, '0x6b616089d04950dc06c45c6dd787d657980543f89651aec47924752c7d16c888'
    ),
    Transfer: new LogEvent<([from: string, to: string, value: ethers.BigNumber] & {from: string, to: string, value: ethers.BigNumber})>(
        abi, '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    ),
}

export const functions = {
    DOMAIN_SEPARATOR: new Func<[], {}, string>(
        abi, '0x3644e515'
    ),
    PERMIT_TYPEHASH: new Func<[], {}, string>(
        abi, '0x30adf81f'
    ),
    Swapin: new Func<[txhash: string, account: string, amount: ethers.BigNumber], {txhash: string, account: string, amount: ethers.BigNumber}, boolean>(
        abi, '0xec126c77'
    ),
    Swapout: new Func<[amount: ethers.BigNumber, bindaddr: string], {amount: ethers.BigNumber, bindaddr: string}, boolean>(
        abi, '0x628d6cba'
    ),
    TRANSFER_TYPEHASH: new Func<[], {}, string>(
        abi, '0x00bf26f4'
    ),
    allowance: new Func<[_: string, _: string], {}, ethers.BigNumber>(
        abi, '0xdd62ed3e'
    ),
    applyMinter: new Func<[], {}, []>(
        abi, '0x0d707df8'
    ),
    applyVault: new Func<[], {}, []>(
        abi, '0xd93f2445'
    ),
    approve: new Func<[spender: string, value: ethers.BigNumber], {spender: string, value: ethers.BigNumber}, boolean>(
        abi, '0x095ea7b3'
    ),
    approveAndCall: new Func<[spender: string, value: ethers.BigNumber, data: string], {spender: string, value: ethers.BigNumber, data: string}, boolean>(
        abi, '0xcae9ca51'
    ),
    balanceOf: new Func<[_: string], {}, ethers.BigNumber>(
        abi, '0x70a08231'
    ),
    burn: new Func<[from: string, amount: ethers.BigNumber], {from: string, amount: ethers.BigNumber}, boolean>(
        abi, '0x9dc29fac'
    ),
    changeMPCOwner: new Func<[newVault: string], {newVault: string}, boolean>(
        abi, '0x5f9b105d'
    ),
    changeVault: new Func<[newVault: string], {newVault: string}, boolean>(
        abi, '0x60e232a9'
    ),
    decimals: new Func<[], {}, number>(
        abi, '0x313ce567'
    ),
    delay: new Func<[], {}, ethers.BigNumber>(
        abi, '0x6a42b8f8'
    ),
    delayDelay: new Func<[], {}, ethers.BigNumber>(
        abi, '0xa29dff72'
    ),
    delayMinter: new Func<[], {}, ethers.BigNumber>(
        abi, '0xc3081240'
    ),
    delayVault: new Func<[], {}, ethers.BigNumber>(
        abi, '0x87689e28'
    ),
    'deposit(uint256,address)': new Func<[amount: ethers.BigNumber, to: string], {amount: ethers.BigNumber, to: string}, ethers.BigNumber>(
        abi, '0x6e553f65'
    ),
    'deposit(uint256)': new Func<[amount: ethers.BigNumber], {amount: ethers.BigNumber}, ethers.BigNumber>(
        abi, '0xb6b55f25'
    ),
    'deposit()': new Func<[], {}, ethers.BigNumber>(
        abi, '0xd0e30db0'
    ),
    depositVault: new Func<[amount: ethers.BigNumber, to: string], {amount: ethers.BigNumber, to: string}, ethers.BigNumber>(
        abi, '0xbebbf4d0'
    ),
    depositWithPermit: new Func<[target: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string, to: string], {target: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string, to: string}, ethers.BigNumber>(
        abi, '0x81a37c18'
    ),
    depositWithTransferPermit: new Func<[target: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string, to: string], {target: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string, to: string}, ethers.BigNumber>(
        abi, '0xf954734e'
    ),
    getAllMinters: new Func<[], {}, Array<string>>(
        abi, '0xa045442c'
    ),
    initVault: new Func<[_vault: string], {_vault: string}, []>(
        abi, '0x2ebe3fbb'
    ),
    isMinter: new Func<[_: string], {}, boolean>(
        abi, '0xaa271e1a'
    ),
    mint: new Func<[to: string, amount: ethers.BigNumber], {to: string, amount: ethers.BigNumber}, boolean>(
        abi, '0x40c10f19'
    ),
    minters: new Func<[_: ethers.BigNumber], {}, string>(
        abi, '0x8623ec7b'
    ),
    mpc: new Func<[], {}, string>(
        abi, '0xf75c2664'
    ),
    name: new Func<[], {}, string>(
        abi, '0x06fdde03'
    ),
    nonces: new Func<[_: string], {}, ethers.BigNumber>(
        abi, '0x7ecebe00'
    ),
    owner: new Func<[], {}, string>(
        abi, '0x8da5cb5b'
    ),
    pendingDelay: new Func<[], {}, ethers.BigNumber>(
        abi, '0x4ca8f0ed'
    ),
    pendingMinter: new Func<[], {}, string>(
        abi, '0x91c5df49'
    ),
    pendingVault: new Func<[], {}, string>(
        abi, '0x52113ba7'
    ),
    permit: new Func<[target: string, spender: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string], {target: string, spender: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string}, []>(
        abi, '0xd505accf'
    ),
    revokeMinter: new Func<[_auth: string], {_auth: string}, []>(
        abi, '0xcfbd4885'
    ),
    setMinter: new Func<[_auth: string], {_auth: string}, []>(
        abi, '0xfca3b5aa'
    ),
    setVault: new Func<[_vault: string], {_vault: string}, []>(
        abi, '0x6817031b'
    ),
    setVaultOnly: new Func<[enabled: boolean], {enabled: boolean}, []>(
        abi, '0xc4b740f5'
    ),
    symbol: new Func<[], {}, string>(
        abi, '0x95d89b41'
    ),
    totalSupply: new Func<[], {}, ethers.BigNumber>(
        abi, '0x18160ddd'
    ),
    transfer: new Func<[to: string, value: ethers.BigNumber], {to: string, value: ethers.BigNumber}, boolean>(
        abi, '0xa9059cbb'
    ),
    transferAndCall: new Func<[to: string, value: ethers.BigNumber, data: string], {to: string, value: ethers.BigNumber, data: string}, boolean>(
        abi, '0x4000aea0'
    ),
    transferFrom: new Func<[from: string, to: string, value: ethers.BigNumber], {from: string, to: string, value: ethers.BigNumber}, boolean>(
        abi, '0x23b872dd'
    ),
    transferWithPermit: new Func<[target: string, to: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string], {target: string, to: string, value: ethers.BigNumber, deadline: ethers.BigNumber, v: number, r: string, s: string}, boolean>(
        abi, '0x605629d6'
    ),
    underlying: new Func<[], {}, string>(
        abi, '0x6f307dc3'
    ),
    vault: new Func<[], {}, string>(
        abi, '0xfbfa77cf'
    ),
    'withdraw(uint256,address)': new Func<[amount: ethers.BigNumber, to: string], {amount: ethers.BigNumber, to: string}, ethers.BigNumber>(
        abi, '0x00f714ce'
    ),
    'withdraw(uint256)': new Func<[amount: ethers.BigNumber], {amount: ethers.BigNumber}, ethers.BigNumber>(
        abi, '0x2e1a7d4d'
    ),
    'withdraw()': new Func<[], {}, ethers.BigNumber>(
        abi, '0x3ccfd60b'
    ),
    withdrawVault: new Func<[from: string, amount: ethers.BigNumber, to: string], {from: string, amount: ethers.BigNumber, to: string}, ethers.BigNumber>(
        abi, '0x0039d6ec'
    ),
}

export class Contract extends ContractBase {

    DOMAIN_SEPARATOR(): Promise<string> {
        return this.eth_call(functions.DOMAIN_SEPARATOR, [])
    }

    PERMIT_TYPEHASH(): Promise<string> {
        return this.eth_call(functions.PERMIT_TYPEHASH, [])
    }

    TRANSFER_TYPEHASH(): Promise<string> {
        return this.eth_call(functions.TRANSFER_TYPEHASH, [])
    }

    allowance(arg0: string, arg1: string): Promise<ethers.BigNumber> {
        return this.eth_call(functions.allowance, [arg0, arg1])
    }

    balanceOf(arg0: string): Promise<ethers.BigNumber> {
        return this.eth_call(functions.balanceOf, [arg0])
    }

    decimals(): Promise<number> {
        return this.eth_call(functions.decimals, [])
    }

    delay(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.delay, [])
    }

    delayDelay(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.delayDelay, [])
    }

    delayMinter(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.delayMinter, [])
    }

    delayVault(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.delayVault, [])
    }

    getAllMinters(): Promise<Array<string>> {
        return this.eth_call(functions.getAllMinters, [])
    }

    isMinter(arg0: string): Promise<boolean> {
        return this.eth_call(functions.isMinter, [arg0])
    }

    minters(arg0: ethers.BigNumber): Promise<string> {
        return this.eth_call(functions.minters, [arg0])
    }

    mpc(): Promise<string> {
        return this.eth_call(functions.mpc, [])
    }

    name(): Promise<string> {
        return this.eth_call(functions.name, [])
    }

    nonces(arg0: string): Promise<ethers.BigNumber> {
        return this.eth_call(functions.nonces, [arg0])
    }

    owner(): Promise<string> {
        return this.eth_call(functions.owner, [])
    }

    pendingDelay(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.pendingDelay, [])
    }

    pendingMinter(): Promise<string> {
        return this.eth_call(functions.pendingMinter, [])
    }

    pendingVault(): Promise<string> {
        return this.eth_call(functions.pendingVault, [])
    }

    symbol(): Promise<string> {
        return this.eth_call(functions.symbol, [])
    }

    totalSupply(): Promise<ethers.BigNumber> {
        return this.eth_call(functions.totalSupply, [])
    }

    underlying(): Promise<string> {
        return this.eth_call(functions.underlying, [])
    }

    vault(): Promise<string> {
        return this.eth_call(functions.vault, [])
    }
}
