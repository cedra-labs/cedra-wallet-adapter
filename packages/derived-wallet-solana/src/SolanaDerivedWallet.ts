import {
  accountInfoFromPublicKey,
  fetchDevnetChainId,
  isNullCallback,
} from "@cedra-labs/derived-wallet-base";
import {
  AccountAuthenticator,
  AnyRawTransaction,
  Network,
  NetworkToChainId,
  NetworkToNodeAPI,
} from "@cedra-labs/ts-sdk";
import {
  AccountInfo,
  CEDRA_CHAINS,
  CedraChangeNetworkOutput,
  CedraConnectOutput,
  CedraFeatures,
  CedraSignMessageInput,
  CedraSignMessageOutput,
  CedraWallet,
  NetworkInfo,
  UserResponse,
  UserResponseStatus,
  WalletIcon,
} from "@cedra-labs/wallet-standard";
import { StandardWalletAdapter as SolanaWalletAdapter } from "@solana/wallet-standard-wallet-adapter-base";
import { PublicKey as SolanaPublicKey } from "@solana/web3.js";
import { defaultAuthenticationFunction } from "./shared";
import { signCedraMessageWithSolana } from "./signCedraMessage";
import { signCedraTransactionWithSolana } from "./signCedraTransaction";
import { SolanaDerivedPublicKey } from "./SolanaDerivedPublicKey";

export type { SolanaPublicKey };
export interface SolanaDomainWalletOptions {
  authenticationFunction?: string;
  defaultNetwork?: Network;
}

export class SolanaDerivedWallet implements CedraWallet {
  readonly solanaWallet: SolanaWalletAdapter;
  readonly domain: string;
  readonly authenticationFunction: string;
  defaultNetwork: Network;

  readonly version = "1.0.0";
  readonly name: string;
  readonly icon: WalletIcon;
  readonly url: string;
  readonly accounts = [];
  readonly chains = CEDRA_CHAINS;

  constructor(
    solanaWallet: SolanaWalletAdapter,
    options: SolanaDomainWalletOptions = {},
  ) {
    const {
      authenticationFunction = defaultAuthenticationFunction,
      defaultNetwork = Network.MAINNET,
    } = options;

    this.solanaWallet = solanaWallet;
    this.domain = window.location.host;
    this.authenticationFunction = authenticationFunction;
    this.defaultNetwork = defaultNetwork;
    this.name = `${solanaWallet.name} (Solana)`;
    this.icon = solanaWallet.icon;
    this.url = solanaWallet.url;
  }

  readonly features: CedraFeatures = {
    "cedra:connect": {
      version: "1.0.0",
      connect: () => this.connect(),
    },
    "cedra:disconnect": {
      version: "1.0.0",
      disconnect: () => this.disconnect(),
    },
    "cedra:account": {
      version: "1.0.0",
      account: () => this.getActiveAccount(),
    },
    "cedra:onAccountChange": {
      version: "1.0.0",
      onAccountChange: async (callback) => this.onActiveAccountChange(callback),
    },
    "cedra:network": {
      version: "1.0.0",
      network: () => this.getActiveNetwork(),
    },
    "cedra:changeNetwork": {
      version: "1.0.0",
      changeNetwork: (newNetwork) => this.changeNetwork(newNetwork),
    },
    "cedra:onNetworkChange": {
      version: "1.0.0",
      onNetworkChange: async (callback) => this.onActiveNetworkChange(callback),
    },
    "cedra:signMessage": {
      version: "1.0.0",
      signMessage: (args) => this.signMessage(args),
    },
    "cedra:signTransaction": {
      version: "1.0.0",
      signTransaction: (...args) => this.signTransaction(...args),
    },
  };

  private derivePublicKey(solanaPublicKey: SolanaPublicKey) {
    return new SolanaDerivedPublicKey({
      domain: this.domain,
      solanaPublicKey,
      authenticationFunction: this.authenticationFunction,
    });
  }

  // region Connection

  async connect(): Promise<UserResponse<CedraConnectOutput>> {
    await this.solanaWallet.connect();
    if (!this.solanaWallet.publicKey) {
      return { status: UserResponseStatus.REJECTED };
    }

    const cedraPublicKey = this.derivePublicKey(this.solanaWallet.publicKey);
    return {
      args: accountInfoFromPublicKey(cedraPublicKey),
      status: UserResponseStatus.APPROVED,
    };
  }

  async disconnect() {
    await this.solanaWallet.disconnect();
  }

  // endregion

  // region Accounts

  private getActivePublicKey(): SolanaDerivedPublicKey {
    if (!this.solanaWallet.publicKey) {
      throw new Error("Account not connected");
    }
    return this.derivePublicKey(this.solanaWallet.publicKey);
  }

  async getActiveAccount() {
    const cedraPublicKey = this.getActivePublicKey();
    return accountInfoFromPublicKey(cedraPublicKey);
  }

  onActiveAccountChange(callback: (newAccount: AccountInfo) => void) {
    if (isNullCallback(callback)) {
      this.solanaWallet.off("connect");
    } else {
      this.solanaWallet.on("connect", (newSolanaPublicKey) => {
        const cedraPublicKey = this.derivePublicKey(newSolanaPublicKey);
        const newCedraAccount = accountInfoFromPublicKey(cedraPublicKey);
        callback(newCedraAccount);
      });
    }
  }

  // endregion

  // region Networks

  readonly onActiveNetworkChangeListeners = new Set<
    (newNetwork: NetworkInfo) => void
  >();

  async getActiveNetwork(): Promise<NetworkInfo> {
    const chainId = NetworkToChainId[this.defaultNetwork];
    const url = NetworkToNodeAPI[this.defaultNetwork];
    return {
      name: this.defaultNetwork,
      chainId,
      url,
    };
  }

  async changeNetwork(
    newNetwork: NetworkInfo,
  ): Promise<UserResponse<CedraChangeNetworkOutput>> {
    const { name, chainId, url } = newNetwork;
    if (name === Network.CUSTOM) {
      throw new Error("Custom network not currently supported");
    }
    this.defaultNetwork = name;
    for (const listener of this.onActiveNetworkChangeListeners) {
      listener({
        name,
        chainId: chainId ?? NetworkToChainId[name],
        url: url ?? NetworkToNodeAPI[name],
      });
    }
    return {
      status: UserResponseStatus.APPROVED,
      args: { success: true },
    };
  }

  onActiveNetworkChange(callback: (newNetwork: NetworkInfo) => void) {
    if (isNullCallback(callback)) {
      this.onActiveNetworkChangeListeners.clear();
    } else {
      this.onActiveNetworkChangeListeners.add(callback);
    }
  }

  // endregion

  // region Signatures

  async signMessage(
    input: CedraSignMessageInput,
  ): Promise<UserResponse<CedraSignMessageOutput>> {
    const chainId = input.chainId
      ? this.defaultNetwork === Network.DEVNET
        ? await fetchDevnetChainId()
        : NetworkToChainId[this.defaultNetwork]
      : undefined;
    return signCedraMessageWithSolana({
      solanaWallet: this.solanaWallet,
      authenticationFunction: this.authenticationFunction,
      messageInput: {
        ...input,
        chainId,
      },
      domain: this.domain,
    });
  }

  async signTransaction(
    rawTransaction: AnyRawTransaction,
    _asFeePayer?: boolean,
  ): Promise<UserResponse<AccountAuthenticator>> {
    return signCedraTransactionWithSolana({
      solanaWallet: this.solanaWallet,
      authenticationFunction: this.authenticationFunction,
      rawTransaction,
      domain: this.domain,
    });
  }

  // endregion
}
