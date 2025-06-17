import { AccountPublicKey, Cedra } from "@cedra-labs/ts-sdk";
import { AccountInfo } from "@cedra-labs/wallet-standard";

export function accountInfoFromPublicKey(publicKey: AccountPublicKey) {
  return new AccountInfo({
    publicKey,
    address: publicKey.authKey().derivedAddress(),
  });
}

export function isNullCallback(callback: Function) {
  return "_isNull" in callback && callback._isNull === true;
}

/**
 * Helper function to fetch Devnet chain id
 */
export const fetchDevnetChainId = async (): Promise<number> => {
  const cedra = new Cedra(); // default to devnet
  return await cedra.getChainId();
};
