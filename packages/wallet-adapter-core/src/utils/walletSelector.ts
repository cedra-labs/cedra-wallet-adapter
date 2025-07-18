import { WalletInfo } from "./types";
import { AdapterNotDetectedWallet, AdapterWallet } from "../WalletCore";
import { CEDRA_CONNECT_BASE_URL, WalletReadyState } from "../constants";
import { isRedirectable } from "./helpers";

/**
 * A function that will partition the provided wallets into two list — `defaultWallets` and `moreWallets`.
 * By default, the wallets will be partitioned by whether or not they are installed or loadable.
 * You can pass your own partition function if you wish to customize this behavior.
 */
export function partitionWallets(
  wallets: ReadonlyArray<AdapterWallet | AdapterNotDetectedWallet>,
  partitionFunction: (
    wallet: AdapterWallet | AdapterNotDetectedWallet,
  ) => boolean = isInstalledOrLoadable,
) {
  const defaultWallets: Array<AdapterWallet> = [];
  const moreWallets: Array<AdapterNotDetectedWallet> = [];

  for (const wallet of wallets) {
    if (partitionFunction(wallet)) defaultWallets.push(wallet as AdapterWallet);
    else moreWallets.push(wallet as AdapterNotDetectedWallet);
  }

  return { defaultWallets, moreWallets };
}

/** Returns true if the wallet is installed or loadable. */
export function isInstalledOrLoadable(
  wallet: AdapterWallet | AdapterNotDetectedWallet,
) {
  return wallet.readyState === WalletReadyState.Installed;
}

/**
 * Returns true if the user is on desktop and the provided wallet requires installation of a browser extension.
 * This can be used to decide whether to show a "Connect" button or "Install" link in the UI.
 */
export function isInstallRequired(
  wallet: AdapterWallet | AdapterNotDetectedWallet,
) {
  const isWalletReady = isInstalledOrLoadable(wallet);
  const isMobile = !isWalletReady && isRedirectable();

  return !isMobile && !isWalletReady;
}

/** Truncates the provided wallet address at the middle with an ellipsis. */
export function truncateAddress(address: string | undefined) {
  if (!address) return;
  return `${address.slice(0, 6)}...${address.slice(-5)}`;
}

/** Returns `true` if the provided wallet is an Cedra Connect wallet. */
export function isCedraConnectWallet(wallet: WalletInfo | AdapterWallet) {
  if (!wallet.url) return false;
  return wallet.url.startsWith(CEDRA_CONNECT_BASE_URL);
}

/**
 * Partitions the `wallets` array so that Cedra Connect wallets are grouped separately from the rest.
 * Cedra Connect is a web wallet that uses social login to create accounts on the blockchain.
 */
export function getCedraConnectWallets(
  wallets: ReadonlyArray<AdapterWallet | AdapterNotDetectedWallet>,
) {
  const { defaultWallets, moreWallets } = partitionWallets(
    wallets,
    isCedraConnectWallet,
  );
  return { cedraConnectWallets: defaultWallets, otherWallets: moreWallets };
}

export interface WalletSortingOptions {
  /** An optional function for sorting Cedra Connect wallets. */
  sortCedraConnectWallets?: (a: AdapterWallet, b: AdapterWallet) => number;
  /** An optional function for sorting wallets that are currently installed or loadable. */
  sortAvailableWallets?: (
    a: AdapterWallet | AdapterNotDetectedWallet,
    b: AdapterWallet | AdapterNotDetectedWallet,
  ) => number;
  /** An optional function for sorting wallets that are NOT currently installed or loadable. */
  sortInstallableWallets?: (
    a: AdapterWallet | AdapterNotDetectedWallet,
    b: AdapterWallet | AdapterNotDetectedWallet,
  ) => number;
}

/**
 * Partitions the `wallets` array into three distinct groups:
 *
 * `cedraConnectWallets` - Wallets that use social login to create accounts on
 * the blockchain via Cedra Connect.
 *
 * `availableWallets` - Wallets that are currently installed or loadable by the client.
 *
 * `installableWallets` - Wallets that are NOT current installed or loadable and
 * require the client to install a browser extension first.
 *
 * Additionally, these wallet groups can be sorted by passing sort functions via the `options` argument.
 */
export function groupAndSortWallets(
  wallets: ReadonlyArray<AdapterWallet | AdapterNotDetectedWallet>,
  options?: WalletSortingOptions,
) {
  const { cedraConnectWallets, otherWallets } = getCedraConnectWallets(wallets);
  const { defaultWallets, moreWallets } = partitionWallets(otherWallets);

  if (options?.sortCedraConnectWallets) {
    cedraConnectWallets.sort(options.sortCedraConnectWallets);
  }
  if (options?.sortAvailableWallets) {
    defaultWallets.sort(options.sortAvailableWallets);
  }
  if (options?.sortInstallableWallets) {
    moreWallets.sort(options.sortInstallableWallets);
  }

  return {
    /** Wallets that use social login to create an account on the blockchain */
    cedraConnectWallets,
    /** Wallets that are currently installed or loadable. */
    availableWallets: defaultWallets,
    /** Wallets that are NOT currently installed or loadable. */
    installableWallets: moreWallets,
  };
}
