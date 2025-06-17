import {
  AccountAuthenticator,
  AnyRawTransaction,
  Cedra,
  CedraConfig,
  Network as CedraNetwork,
  Account,
} from "@cedra-labs/ts-sdk";

import {
  Chain,
  Network,
  SignAndSendSigner,
  TxHash,
  UnsignedTransaction,
} from "@wormhole-foundation/sdk";
import {
  CedraUnsignedTransaction,
  CedraChains,
} from "@wormhole-foundation/sdk-cedra";
import { GasStationApiKey } from "../types";

export class CedraLocalSigner<N extends Network, C extends Chain>
  implements SignAndSendSigner<N, C>
{
  _chain: C;
  _options: any;
  _wallet: Account;
  _sponsorAccount: Account | GasStationApiKey | undefined;
  _claimedTransactionHashes: string;

  constructor(
    chain: C,
    options: any,
    wallet: Account,
    feePayerAccount: Account | GasStationApiKey | undefined,
  ) {
    this._chain = chain;
    this._options = options;
    this._wallet = wallet;
    this._sponsorAccount = feePayerAccount;
    this._claimedTransactionHashes = "";
  }

  chain(): C {
    return this._chain;
  }
  address(): string {
    return this._wallet.accountAddress.toString();
  }

  claimedTransactionHashes(): string {
    return this._claimedTransactionHashes;
  }
  /* other methods... */

  async signAndSend(txs: UnsignedTransaction<N, C>[]): Promise<TxHash[]> {
    const txHashes: TxHash[] = [];

    for (const tx of txs) {
      const txId = await signAndSendTransaction(
        tx as CedraUnsignedTransaction<Network, CedraChains>,
        this._wallet,
        this._sponsorAccount,
      );
      txHashes.push(txId);
      this._claimedTransactionHashes = txId;
    }
    return txHashes;
  }
}

export async function signAndSendTransaction(
  request: UnsignedTransaction<Network, CedraChains>,
  wallet: Account,
  sponsorAccount: Account | GasStationApiKey | undefined,
) {
  if (!wallet) {
    throw new Error("Wallet is undefined");
  }

  const payload = request.transaction;
  // The wallets do not handle Uint8Array serialization
  payload.functionArguments = payload.functionArguments.map((a: any) => {
    if (a instanceof Uint8Array) {
      return Array.from(a);
    } else if (typeof a === "bigint") {
      return a.toString();
    } else {
      return a;
    }
  });

  const cedraConfig = new CedraConfig({
    network: CedraNetwork.TESTNET,
  });
  const cedra = new Cedra(cedraConfig);

  const txnToSign = await cedra.transaction.build.simple({
    data: payload,
    sender: wallet.accountAddress.toString(),
    withFeePayer: sponsorAccount ? true : false,
  });
  const senderAuthenticator = await cedra.transaction.sign({
    signer: wallet,
    transaction: txnToSign,
  });

  const txnToSubmit: {
    transaction: AnyRawTransaction;
    senderAuthenticator: AccountAuthenticator;
    feePayerAuthenticator?: AccountAuthenticator;
  } = {
    transaction: txnToSign,
    senderAuthenticator,
  };

  if (sponsorAccount) {
    if (typeof sponsorAccount === "string") {
      // TODO: handle gas station integration here
    } else {
      const feePayerSignerAuthenticator = cedra.transaction.signAsFeePayer({
        signer: sponsorAccount as Account,
        transaction: txnToSign,
      });
      txnToSubmit.feePayerAuthenticator = feePayerSignerAuthenticator;
    }
  }
  const response = await cedra.transaction.submit.simple(txnToSubmit);

  const tx = await cedra.waitForTransaction({
    transactionHash: response.hash,
  });

  return tx.hash;
}
