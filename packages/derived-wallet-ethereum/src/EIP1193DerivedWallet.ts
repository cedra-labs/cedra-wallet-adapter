import {
  fetchDevnetChainId,
  isNullCallback,
  mapUserResponse,
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
import { BrowserProvider } from "ethers";
import type { EIP1193Provider, EIP6963ProviderDetail } from "mipd";
import { EIP1193DerivedPublicKey } from "./EIP1193DerivedPublicKey";
import { EthereumAddress, wrapEthersUserResponse } from "./shared";
import { signCedraMessageWithEthereum } from "./signCedraMessage";
import { signCedraTransactionWithEthereum } from "./signCedraTransaction";

const defaultAuthenticationFunction =
  "0x1::ethereum_derivable_account::authenticate";

export interface EIP1193DerivedWalletOptions {
  authenticationFunction?: string;
  defaultNetwork?: Network;
}

export class EIP1193DerivedWallet implements CedraWallet {
  readonly eip1193Provider: EIP1193Provider;
  readonly eip1193Ethers: BrowserProvider;
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
    providerDetail: EIP6963ProviderDetail,
    options: EIP1193DerivedWalletOptions = {},
  ) {
    const { info, provider } = providerDetail;
    const {
      authenticationFunction = defaultAuthenticationFunction,
      defaultNetwork = Network.MAINNET,
    } = options;

    this.eip1193Provider = provider;
    this.eip1193Ethers = new BrowserProvider(provider);

    this.domain = window.location.host;
    this.authenticationFunction = authenticationFunction;
    this.defaultNetwork = defaultNetwork;
    this.name = `${info.name} (Ethereum)`;
    // Phantom's icon is wrapped with new lines :shrug:
    this.icon = info.icon.trim() as WalletIcon;
    this.url = info.rdns;
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

  private derivePublicKey(ethereumAddress: EthereumAddress) {
    return new EIP1193DerivedPublicKey({
      domain: this.domain,
      ethereumAddress,
      authenticationFunction: this.authenticationFunction,
    });
  }

  // region Connection

  async connect(): Promise<UserResponse<CedraConnectOutput>> {
    const response = await wrapEthersUserResponse(
      this.eip1193Ethers.getSigner(),
    );
    return mapUserResponse(response, (account) => {
      const publicKey = this.derivePublicKey(
        account.address as EthereumAddress,
      );
      const cedraAddress = publicKey.authKey().derivedAddress();
      return new AccountInfo({ publicKey, address: cedraAddress });
    });
  }

  async disconnect() {
    // TODO: Eip1193 doesn't provide a "disconnect" method, so we have to keep track locally
  }

  // endregion

  // region Accounts

  async getActiveAccount() {
    const [activeAccount] = await this.eip1193Ethers.listAccounts();
    if (!activeAccount) {
      throw new Error("Account not connected");
    }
    const publicKey = this.derivePublicKey(
      activeAccount.address as EthereumAddress,
    );
    const cedraAddress = publicKey.authKey().derivedAddress();
    return new AccountInfo({ publicKey, address: cedraAddress });
  }

  private onAccountsChangedListeners: ((
    newAccounts: EthereumAddress[],
  ) => void)[] = [];

  onActiveAccountChange(callback: (newAccount: AccountInfo) => void) {
    if (isNullCallback(callback)) {
      for (const listener of this.onAccountsChangedListeners) {
        this.eip1193Provider.removeListener("accountsChanged", listener);
      }
      this.onAccountsChangedListeners = [];
    } else {
      const listener = ([ethereumAddress]: EthereumAddress[]) => {
        if (!ethereumAddress) {
          callback(undefined as any as AccountInfo);
          return;
        }
        const publicKey = this.derivePublicKey(ethereumAddress);
        const cedraAddress = publicKey.authKey().derivedAddress();
        const account = new AccountInfo({ publicKey, address: cedraAddress });
        callback(account);
      };
      this.onAccountsChangedListeners.push(listener);
      this.eip1193Provider.on("accountsChanged", listener);
    }
  }

  // endregion

  // region Networks

  private onActiveNetworkChangeListeners: ((
    newNetwork: NetworkInfo,
  ) => void)[] = [];

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
      this.onActiveNetworkChangeListeners = [];
    } else {
      this.onActiveNetworkChangeListeners.push(callback);
    }
  }

  // endregion

  // region Signatures

  async signMessage(
    input: CedraSignMessageInput,
  ): Promise<UserResponse<CedraSignMessageOutput>> {
    const chainId =
      this.defaultNetwork === Network.DEVNET
        ? await fetchDevnetChainId()
        : NetworkToChainId[this.defaultNetwork];
    return signCedraMessageWithEthereum({
      eip1193Provider: this.eip1193Provider,
      authenticationFunction: this.authenticationFunction,
      messageInput: {
        ...input,
        chainId,
      },
    });
  }

  async signTransaction(
    rawTransaction: AnyRawTransaction,
    _asFeePayer?: boolean,
  ): Promise<UserResponse<AccountAuthenticator>> {
    return signCedraTransactionWithEthereum({
      eip1193Provider: this.eip1193Provider,
      authenticationFunction: this.authenticationFunction,
      rawTransaction,
    });
  }

  // endregion
}
