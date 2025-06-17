import { AccountAuthenticator, AnyRawTransaction } from "@cedra-labs/ts-sdk";
import {
  CedraSignMessageOutput,
  UserResponse,
} from "@cedra-labs/wallet-standard";
import { StandardWalletAdapter as SolanaWalletAdapter } from "@solana/wallet-standard-wallet-adapter-base";
import { PublicKey as SolanaPublicKey } from "@solana/web3.js";
import { defaultAuthenticationFunction } from "./shared";
import {
  signCedraMessageWithSolana,
  StructuredMessageInputWithChainId,
} from "./signCedraMessage";
import { signCedraTransactionWithSolana } from "./signCedraTransaction";
import { SolanaDerivedPublicKey } from "./SolanaDerivedPublicKey";

export type SolanaWalletAdapterWithCedraFeatures = SolanaWalletAdapter & {
  getCedraPublicKey: (
    solanaPublicKey: SolanaPublicKey,
  ) => SolanaDerivedPublicKey;
  signCedraTransaction: (
    rawTransaction: AnyRawTransaction,
  ) => Promise<UserResponse<AccountAuthenticator>>;
  signCedraMessage: (
    input: StructuredMessageInputWithChainId,
  ) => Promise<UserResponse<CedraSignMessageOutput>>;
};

/**
 * Utility function for extending a SolanaWalletAdapter with Cedra features.
 * @param solanaWallet the source wallet adapter
 * @param authenticationFunction authentication function required for DAA
 *
 * @example
 * ```typescript
 * const extendedWallet = extendSolanaWallet(solanaWallet, authenticationFunction);
 *
 * const solanaSignature = await extendedWallet.signTransaction(solanaTransaction);
 * const cedraSignature = await extendedWallet.signCedraTransaction(cedraRawTransaction);
 * ```
 */
export function extendSolanaWallet(
  solanaWallet: SolanaWalletAdapter,
  authenticationFunction = defaultAuthenticationFunction,
) {
  const extended = solanaWallet as SolanaWalletAdapterWithCedraFeatures;
  extended.getCedraPublicKey = (solanaPublicKey: SolanaPublicKey) =>
    new SolanaDerivedPublicKey({
      solanaPublicKey,
      domain: window.location.host,
      authenticationFunction,
    });
  extended.signCedraTransaction = (rawTransaction: AnyRawTransaction) =>
    signCedraTransactionWithSolana({
      solanaWallet,
      authenticationFunction,
      rawTransaction,
      domain: window.location.host,
    });
  extended.signCedraMessage = (messageInput) => {
    return signCedraMessageWithSolana({
      solanaWallet,
      authenticationFunction,
      messageInput,
      domain: window.location.host,
    });
  };
  return extended;
}
