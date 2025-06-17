import {
  Account,
  AccountAuthenticator,
  AnyRawTransaction,
  Cedra,
  CedraConfig,
  Network,
  SigningScheme,
} from "@cedra-labs/ts-sdk";
import {
  CEDRA_CHAINS,
  AccountInfo,
  CedraConnectMethod,
  CedraDisconnectMethod,
  CedraGetAccountMethod,
  CedraGetNetworkMethod,
  CedraOnAccountChangeMethod,
  CedraSignMessageInput,
  CedraSignMessageMethod,
  CedraSignMessageOutput,
  CedraSignTransactionMethod,
  CedraWallet,
  IdentifierArray,
  NetworkInfo,
  UserResponse,
  registerWallet as _registerWallet,
  CedraWalletAccount,
  CedraOnNetworkChangeMethod,
  CedraFeatures,
  UserResponseStatus,
} from "@cedra-labs/wallet-standard";

/**
 * A class to create a mock wallet for demonstration a wallet
 * implementation compatible with Cedra AIP-62 Wallet Standard
 */
export class MyWalletAccount implements CedraWalletAccount {
  address: string;

  publicKey: Uint8Array;

  chains: IdentifierArray;

  features: IdentifierArray;

  signingScheme: SigningScheme;

  label?: string;

  icon?:
    | `data:image/svg+xml;base64,${string}`
    | `data:image/webp;base64,${string}`
    | `data:image/png;base64,${string}`
    | `data:image/gif;base64,${string}`
    | undefined;

  constructor(account: Account) {
    this.address = account.accountAddress.toString();
    this.publicKey = account.publicKey.toUint8Array();
    this.chains = CEDRA_CHAINS;
    this.features = ["cedra:connect"];
    this.signingScheme = SigningScheme.Ed25519;
  }
}

export class MyWallet implements CedraWallet {
  readonly url: string = "https://cedra.dev";
  readonly version = "1.0.0";
  readonly name: string = "Cedra Burner";
  readonly icon =
    "data:image/png;base64,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";
  chains = CEDRA_CHAINS;
  accounts: MyWalletAccount[] = [];

  // Local MyWallet class variables
  signer: Account;
  cedra: Cedra;

  get features(): CedraFeatures {
    return {
      "cedra:connect": {
        version: "1.0.0",
        connect: this.connect,
      },
      "cedra:network": {
        version: "1.0.0",
        network: this.network,
      },
      "cedra:disconnect": {
        version: "1.0.0",
        disconnect: this.disconnect,
      },
      "cedra:signTransaction": {
        version: "1.0.0",
        signTransaction: this.signTransaction,
      },
      "cedra:signMessage": {
        version: "1.0.0",
        signMessage: this.signMessage,
      },
      "cedra:onAccountChange": {
        version: "1.0.0",
        onAccountChange: this.onAccountChange,
      },
      "cedra:onNetworkChange": {
        version: "1.0.0",
        onNetworkChange: this.onNetworkChange,
      },
      "cedra:account": {
        version: "1.0.0",
        account: this.account,
      },
    };
  }

  constructor() {
    // Local MyWallet class variables
    this.signer = Account.generate();
    const cedraConfig = new CedraConfig({
      network: Network.DEVNET,
    });
    this.cedra = new Cedra(cedraConfig);

    this.accounts = [new MyWalletAccount(this.signer)];
  }

  account: CedraGetAccountMethod = async (): Promise<AccountInfo> => {
    const account = new AccountInfo({
      address: this.signer.accountAddress,
      publicKey: this.signer.publicKey,
    });
    return Promise.resolve(account);
  };

  connect: CedraConnectMethod = async (): Promise<
    UserResponse<AccountInfo>
  > => {
    try {
      await this.cedra.fundAccount({
        accountAddress: this.signer.accountAddress,
        amount: 1_000_000_000_000,
      });
      const account = new AccountInfo({
        address: this.signer.accountAddress,
        publicKey: this.signer.publicKey,
      });
      return {
        status: UserResponseStatus.APPROVED,
        args: account,
      };
    } catch (e) {
      throw Error(`error connecting to wallet ${e}`);
    }
  };

  network: CedraGetNetworkMethod = async (): Promise<NetworkInfo> => {
    const network = await this.cedra.getLedgerInfo();
    return {
      name: Network.DEVNET,
      chainId: network.chain_id,
      url: "https://fullnode.devnet.cedralabs.com/v1",
    };
  };

  disconnect: CedraDisconnectMethod = async (): Promise<void> => {
    return Promise.resolve();
  };

  signTransaction: CedraSignTransactionMethod = async (
    transaction: AnyRawTransaction,
    asFeePayer?: boolean,
  ): Promise<UserResponse<AccountAuthenticator>> => {
    if (asFeePayer) {
      const senderAuthenticator = this.cedra.transaction.signAsFeePayer({
        signer: this.signer,
        transaction,
      });

      return Promise.resolve({
        status: UserResponseStatus.APPROVED,
        args: senderAuthenticator,
      });
    }
    const senderAuthenticator = this.cedra.transaction.sign({
      signer: this.signer,
      transaction,
    });

    return Promise.resolve({
      status: UserResponseStatus.APPROVED,
      args: senderAuthenticator,
    });
  };

  signMessage: CedraSignMessageMethod = async (
    input: CedraSignMessageInput,
  ): Promise<UserResponse<CedraSignMessageOutput>> => {
    // 'Cedra' + application + address + nonce + chainId + message
    const messageToSign = `Cedra
    demoAdapter
    ${this.signer.accountAddress.toString()}
    ${input.nonce}
    ${input.chainId ?? (await this.network()).chainId}
    ${input.message}`;

    const encodedMessageToSign = new TextEncoder().encode(messageToSign);

    const signature = this.signer.sign(encodedMessageToSign);

    return Promise.resolve({
      status: UserResponseStatus.APPROVED,
      args: {
        address: this.signer.accountAddress.toString(),
        fullMessage: messageToSign,
        message: input.message,
        nonce: input.nonce,
        prefix: "CEDRA",
        signature: signature,
      },
    });
  };

  onAccountChange: CedraOnAccountChangeMethod = async (): Promise<void> => {
    return Promise.resolve();
  };

  onNetworkChange: CedraOnNetworkChangeMethod = async (): Promise<void> => {
    return Promise.resolve();
  };
}

export function registerWallet() {
  if (typeof window === "undefined") return;
  const myWallet = new MyWallet();
  _registerWallet(myWallet);
}
