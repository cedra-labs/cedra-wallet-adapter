import { Account, Network } from "@cedra-labs/ts-sdk";

import {
  WormholeInitiateTransferRequest,
  WormholeInitiateTransferResponse,
  WormholeProvider,
  WormholeQuoteRequest,
  WormholeQuoteResponse,
} from "./providers/wormhole";

import {
  ChainsConfig,
  testnetChains,
  testnetTokens,
  mainnetChains,
  mainnetTokens,
  TokenConfig,
  CedraTestnetUSDCToken,
  CedraMainnetUSDCToken,
} from "./config";
import {
  getCedraWalletUSDCBalance,
  getEthereumWalletUSDCBalance,
  getSolanaWalletUSDCBalance,
} from "./utils/getUsdcBalance";

export interface CrossChainDappConfig {
  cedraNetwork: Network;
  disableTelemetry?: boolean;
  solanaConfig?: {
    rpc?: string;
    priorityFeeConfig?: {
      percentile?: number;
      percentileMultiple?: number;
      min?: number;
      max?: number;
    };
  };
}
export type { AccountAddressInput } from "@cedra-labs/ts-sdk";
export { NetworkToChainId, NetworkToNodeAPI } from "@cedra-labs/ts-sdk";
export type CedraAccount = Account;

export type Chain = "Solana" | "Ethereum" | "Sepolia" | "Cedra";

export type CCTPProviders = "Wormhole";

export interface CrossChainProvider<
  TQuoteRequest = any,
  TQuoteResponse = any,
  TInitiateTransferRequest = any,
  TInitiateTransferResponse = any,
> {
  getQuote(params: TQuoteRequest): Promise<TQuoteResponse>;
  initiateCCTPTransfer(
    params: TInitiateTransferRequest,
  ): Promise<TInitiateTransferResponse>;
}

export class CrossChainCore {
  readonly _dappConfig: CrossChainDappConfig = {
    cedraNetwork: Network.TESTNET,
  };

  readonly CHAINS: ChainsConfig = testnetChains;
  readonly TOKENS: Record<string, TokenConfig> = testnetTokens;

  readonly CEDRA_TOKEN: TokenConfig = CedraTestnetUSDCToken;

  constructor(args: { dappConfig: CrossChainDappConfig }) {
    this._dappConfig = args.dappConfig;
    if (args.dappConfig?.cedraNetwork === Network.MAINNET) {
      this.CHAINS = mainnetChains;
      this.TOKENS = mainnetTokens;
      this.CEDRA_TOKEN = CedraMainnetUSDCToken;
    } else {
      this.CHAINS = testnetChains;
      this.TOKENS = testnetTokens;
      this.CEDRA_TOKEN = CedraTestnetUSDCToken;
    }
  }

  getProvider(providerType: CCTPProviders): CrossChainProvider {
    switch (providerType) {
      case "Wormhole":
        return new WormholeProvider(this) as CrossChainProvider<
          WormholeQuoteRequest,
          WormholeQuoteResponse,
          WormholeInitiateTransferRequest,
          WormholeInitiateTransferResponse
        >;
      default:
        throw new Error(`Unknown provider: ${providerType}`);
    }
  }

  async getWalletUSDCBalance(
    walletAddress: string,
    sourceChain: Chain,
  ): Promise<string> {
    if (sourceChain === "Cedra") {
      return await getCedraWalletUSDCBalance(
        walletAddress,
        this._dappConfig.cedraNetwork,
      );
    }
    if (!this.CHAINS[sourceChain]) {
      throw new Error(`Unsupported chain: ${sourceChain}`);
    }
    switch (sourceChain) {
      case "Solana":
        return await getSolanaWalletUSDCBalance(
          walletAddress,
          this._dappConfig.cedraNetwork,
          this._dappConfig?.solanaConfig?.rpc ??
            this.CHAINS[sourceChain].defaultRpc,
        );
      case "Ethereum":
      case "Sepolia":
        return await getEthereumWalletUSDCBalance(
          walletAddress,
          this._dappConfig.cedraNetwork,
          // TODO: maybe let the user config it
          this.CHAINS[sourceChain].defaultRpc,
        );
      default:
        throw new Error(`Unsupported chain: ${sourceChain}`);
    }
  }
}
