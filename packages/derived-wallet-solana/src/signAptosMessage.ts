import {
  encodeStructuredMessage,
  mapUserResponse,
  StructuredMessage,
  StructuredMessageInput,
} from "@cedra-labs/derived-wallet-base";
import { Ed25519Signature, hashValues } from "@cedra-labs/ts-sdk";
import { CedraSignMessageOutput } from "@cedra-labs/wallet-standard";
import { StandardWalletAdapter as SolanaWalletAdapter } from "@solana/wallet-standard-wallet-adapter-base";
import { createSiwsEnvelopeForCedraStructuredMessage } from "./createSiwsEnvelope";
import { wrapSolanaUserResponse } from "./shared";
import { SolanaDerivedPublicKey } from "./SolanaDerivedPublicKey";

export interface StructuredMessageInputWithChainId
  extends StructuredMessageInput {
  chainId?: number;
}

export interface SignCedraMessageWithSolanaInput {
  solanaWallet: SolanaWalletAdapter;
  authenticationFunction: string;
  messageInput: StructuredMessageInputWithChainId;
  domain: string;
}

export async function signCedraMessageWithSolana(
  input: SignCedraMessageWithSolanaInput,
) {
  const { solanaWallet, authenticationFunction, messageInput, domain } = input;

  if (!solanaWallet.signIn) {
    throw new Error("solana:signIn not available");
  }

  const solanaPublicKey = solanaWallet.publicKey;
  if (!solanaPublicKey) {
    throw new Error("Account not connected");
  }

  const cedraPublicKey = new SolanaDerivedPublicKey({
    domain,
    solanaPublicKey,
    authenticationFunction,
  });

  const { message, nonce, chainId, ...flags } = messageInput;
  const cedraAddress = flags.address
    ? cedraPublicKey.authKey().derivedAddress()
    : undefined;
  const application = flags.application ? window.location.origin : undefined;
  const structuredMessage: StructuredMessage = {
    address: cedraAddress?.toString(),
    application,
    chainId,
    message,
    nonce,
  };

  const signingMessage = encodeStructuredMessage(structuredMessage);
  const signingMessageDigest = hashValues([signingMessage]);

  const siwsInput = createSiwsEnvelopeForCedraStructuredMessage({
    solanaPublicKey: cedraPublicKey.solanaPublicKey,
    structuredMessage,
    signingMessageDigest,
    domain,
  });

  const response = await wrapSolanaUserResponse(solanaWallet.signIn(siwsInput));

  return mapUserResponse(response, (output): CedraSignMessageOutput => {
    if (output.signatureType && output.signatureType !== "ed25519") {
      throw new Error("Unsupported signature type");
    }

    // The wallet might change some of the fields in the SIWS input, so we
    // might need to include the finalized input in the signature.
    // For now, we can assume the input is unchanged.
    const signature = new Ed25519Signature(output.signature);
    const fullMessage = new TextDecoder().decode(signingMessage);

    return {
      prefix: "CEDRA",
      fullMessage,
      message,
      nonce,
      signature,
    };
  });
}
