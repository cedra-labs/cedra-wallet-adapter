import {
  encodeStructuredMessage,
  mapUserResponse,
  StructuredMessage,
  StructuredMessageInput,
} from "@cedra-labs/derived-wallet-base";
import { hashValues } from "@cedra-labs/ts-sdk";
import {
  CedraSignMessageOutput,
  UserResponse,
} from "@cedra-labs/wallet-standard";
import { BrowserProvider, Eip1193Provider } from "ethers";
import { createSiweEnvelopeForCedraStructuredMessage } from "./createSiweEnvelope";
import { EIP1193DerivedPublicKey } from "./EIP1193DerivedPublicKey";
import { EIP1193DerivedSignature } from "./EIP1193DerivedSignature";
import { EthereumAddress, wrapEthersUserResponse } from "./shared";

export interface StructuredMessageInputWithChainId
  extends StructuredMessageInput {
  chainId: number;
}

export interface SignCedraMessageWithEthereumInput {
  eip1193Provider: Eip1193Provider | BrowserProvider;
  ethereumAddress?: EthereumAddress;
  authenticationFunction: string;
  messageInput: StructuredMessageInputWithChainId;
}

export async function signCedraMessageWithEthereum(
  input: SignCedraMessageWithEthereumInput,
): Promise<UserResponse<CedraSignMessageOutput>> {
  const { authenticationFunction, messageInput } = input;
  const eip1193Provider =
    input.eip1193Provider instanceof BrowserProvider
      ? input.eip1193Provider
      : new BrowserProvider(input.eip1193Provider);

  const accounts = await eip1193Provider.listAccounts();
  const ethereumAccount = input.ethereumAddress
    ? accounts.find((account) => account.address === input.ethereumAddress)
    : accounts[0];
  if (!ethereumAccount) {
    throw new Error("Account not connected");
  }
  const ethereumAddress = ethereumAccount.address as EthereumAddress;

  const cedraPublicKey = new EIP1193DerivedPublicKey({
    domain: window.location.origin,
    ethereumAddress,
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

  // We need to provide `issuedAt` externally so that we can match it with the signature
  const issuedAt = new Date();
  const siweMessage = createSiweEnvelopeForCedraStructuredMessage({
    ethereumAddress,
    chainId,
    structuredMessage,
    signingMessageDigest,
    issuedAt,
  });

  const response = await wrapEthersUserResponse(
    ethereumAccount.signMessage(siweMessage),
  );

  return mapUserResponse(response, (siweSignature) => {
    const scheme = window.location.protocol.slice(0, -1);
    const signature = new EIP1193DerivedSignature(
      scheme,
      issuedAt,
      siweSignature,
    );
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
