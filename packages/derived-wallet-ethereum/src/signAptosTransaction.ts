import {
  DerivableAbstractPublicKey,
  mapUserResponse,
} from "@cedra-labs/derived-wallet-base";
import {
  AccountAuthenticator,
  AccountAuthenticatorAbstraction,
  AnyRawTransaction,
  generateSigningMessageForTransaction,
  hashValues,
  Serializer,
} from "@cedra-labs/ts-sdk";
import { UserResponse } from "@cedra-labs/wallet-standard";
import { BrowserProvider, Eip1193Provider } from "ethers";
import { createSiweEnvelopeForCedraTransaction } from "./createSiweEnvelope";
import { EIP1193DerivedSignature } from "./EIP1193DerivedSignature";
import { EthereumAddress, wrapEthersUserResponse } from "./shared";

/**
 * A first byte of the signature that indicates the "message type", this is defined in the
 * authentication function on chain, and lets us identify the type of the message and to make
 * changes in the future if needed.
 */
export const SIGNATURE_TYPE = 1;
export interface SignCedraTransactionWithEthereumInput {
  eip1193Provider: Eip1193Provider | BrowserProvider;
  ethereumAddress?: EthereumAddress;
  authenticationFunction: string;
  rawTransaction: AnyRawTransaction;
}

export async function signCedraTransactionWithEthereum(
  input: SignCedraTransactionWithEthereumInput
): Promise<UserResponse<AccountAuthenticator>> {
  const { authenticationFunction, rawTransaction } = input;
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

  const signingMessage = generateSigningMessageForTransaction(rawTransaction);
  const signingMessageDigest = hashValues([signingMessage]);

  const chainId = rawTransaction.rawTransaction.chain_id.chainId;

  // We need to provide `issuedAt` externally so that we can match it with the signature
  const issuedAt = new Date();

  const siweMessage = createSiweEnvelopeForCedraTransaction({
    ethereumAddress,
    chainId,
    rawTransaction,
    signingMessageDigest,
    issuedAt,
  });

  const response = await wrapEthersUserResponse(
    ethereumAccount.signMessage(siweMessage)
  );

  return mapUserResponse(response, (siweSignature) => {
    // Serialize the signature with the signature type as the first byte.
    const serializer = new Serializer();
    serializer.serializeU8(SIGNATURE_TYPE);
    // Remove the trailing colon from the scheme
    const scheme = window.location.protocol.slice(0, -1);
    const signature = new EIP1193DerivedSignature(
      scheme,
      issuedAt,
      siweSignature
    );
    signature.serialize(serializer);
    const abstractSignature = serializer.toUint8Array();

    // Serialize the abstract public key.
    const abstractPublicKey = new DerivableAbstractPublicKey(
      ethereumAddress,
      window.location.host
    );

    return new AccountAuthenticatorAbstraction(
      authenticationFunction,
      signingMessageDigest,
      abstractSignature,
      abstractPublicKey.bcsToBytes()
    );
  });
}
