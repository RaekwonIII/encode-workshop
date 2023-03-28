import assert from 'assert'
import {Block, BlockContext, Chain, ChainContext, Option, Result, StorageBase} from './support'
import * as v900 from './v900'

export class BalancesAccountStorage extends StorageBase {
    protected getPrefix() {
        return 'Balances'
    }

    protected getName() {
        return 'Account'
    }

    /**
     *  The balance of an account.
     * 
     *  NOTE: This is only used in the case that this pallet is used to store balances.
     */
    get isV900(): boolean {
        return this.getTypeHash() === '17669917f628c38832645ae9b39d0bab5a99964e3446b9b2ef904cad2f4bd653'
    }

    /**
     *  The balance of an account.
     * 
     *  NOTE: This is only used in the case that this pallet is used to store balances.
     */
    get asV900(): BalancesAccountStorageV900 {
        assert(this.isV900)
        return this as any
    }
}

/**
 *  The balance of an account.
 * 
 *  NOTE: This is only used in the case that this pallet is used to store balances.
 */
export interface BalancesAccountStorageV900 {
    get(key: Uint8Array): Promise<v900.AccountData>
    getAll(): Promise<v900.AccountData[]>
    getMany(keys: Uint8Array[]): Promise<v900.AccountData[]>
    getKeys(): Promise<Uint8Array[]>
    getKeys(key: Uint8Array): Promise<Uint8Array[]>
    getKeysPaged(pageSize: number): AsyncIterable<Uint8Array[]>
    getKeysPaged(pageSize: number, key: Uint8Array): AsyncIterable<Uint8Array[]>
    getPairs(): Promise<[k: Uint8Array, v: v900.AccountData][]>
    getPairs(key: Uint8Array): Promise<[k: Uint8Array, v: v900.AccountData][]>
    getPairsPaged(pageSize: number): AsyncIterable<[k: Uint8Array, v: v900.AccountData][]>
    getPairsPaged(pageSize: number, key: Uint8Array): AsyncIterable<[k: Uint8Array, v: v900.AccountData][]>
}
