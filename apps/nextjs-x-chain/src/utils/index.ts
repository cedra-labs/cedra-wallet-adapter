import { Cedra, CedraConfig, Network } from "@cedra-labs/ts-sdk";
import { NetworkInfo } from "@cedra-labs/wallet-adapter-core";

export const cedraClient = (network?: NetworkInfo | null) => {
  if (network?.name === Network.DEVNET) {
    return DEVNET_CLIENT;
  } else if (network?.name === Network.TESTNET) {
    return TESTNET_CLIENT;
  } else if (network?.name === Network.MAINNET) {
    throw new Error("Please use devnet or testnet for testing");
  } else {
    const CUSTOM_CONFIG = new CedraConfig({
      network: Network.CUSTOM,
      fullnode: network?.url,
    });
    return new Cedra(CUSTOM_CONFIG);
  }
};

// Devnet client
export const DEVNET_CONFIG = new CedraConfig({
  network: Network.DEVNET,
});
export const DEVNET_CLIENT = new Cedra(DEVNET_CONFIG);

// Testnet client
export const TESTNET_CONFIG = new CedraConfig({ network: Network.TESTNET });
export const TESTNET_CLIENT = new Cedra(TESTNET_CONFIG);

export const isSendableNetwork = (
  connected: boolean,
  networkName?: string,
): boolean => {
  return connected && !isMainnet(connected, networkName);
};

export const isMainnet = (
  connected: boolean,
  networkName?: string,
): boolean => {
  return connected && networkName === Network.MAINNET;
};
