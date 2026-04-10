import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBZYEZGNAP6X7KG6ZS7MYUH33N2XW66Z35T46MNXKELROZMIJPSAJMBL",
  }
} as const


export interface Subscription {
  amount: i128;
  interval: u64;
  last_payment: u64;
  subscriber: string;
}

export interface Client {
  /**
   * Construct and simulate a pay transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pay: ({subscriber}: {subscriber: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a cancel transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel: ({subscriber}: {subscriber: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_subscription transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_subscription: ({subscriber}: {subscriber: string}, options?: MethodOptions) => Promise<AssembledTransaction<Subscription>>

  /**
   * Construct and simulate a create_subscription transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_subscription: ({subscriber, amount, interval}: {subscriber: string, amount: i128, interval: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAADFN1YnNjcmlwdGlvbgAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAIaW50ZXJ2YWwAAAAGAAAAAAAAAAxsYXN0X3BheW1lbnQAAAAGAAAAAAAAAApzdWJzY3JpYmVyAAAAAAAT",
        "AAAAAAAAAAAAAAADcGF5AAAAAAEAAAAAAAAACnN1YnNjcmliZXIAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAGY2FuY2VsAAAAAAABAAAAAAAAAApzdWJzY3JpYmVyAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAQZ2V0X3N1YnNjcmlwdGlvbgAAAAEAAAAAAAAACnN1YnNjcmliZXIAAAAAABMAAAABAAAH0AAAAAxTdWJzY3JpcHRpb24=",
        "AAAAAAAAAAAAAAATY3JlYXRlX3N1YnNjcmlwdGlvbgAAAAADAAAAAAAAAApzdWJzY3JpYmVyAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACGludGVydmFsAAAABgAAAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    pay: this.txFromJSON<null>,
        cancel: this.txFromJSON<null>,
        get_subscription: this.txFromJSON<Subscription>,
        create_subscription: this.txFromJSON<null>
  }
}