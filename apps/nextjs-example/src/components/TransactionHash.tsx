import { NetworkInfo, isCedraNetwork } from "@cedra-labs/wallet-adapter-core";

export interface TransactionHashProps {
  hash: string;
  network: NetworkInfo | null;
}

export function TransactionHash({ hash, network }: TransactionHashProps) {
  if (isCedraNetwork(network)) {
    const explorerLink = `https://explorer.cedralabs.com/txn/${hash}${network?.name ? `?network=${network.name}` : ""}`;
    return (
      <>
        View on Explorer:{" "}
        <a
          href={explorerLink}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 dark:text-blue-300"
        >
          {explorerLink}
        </a>
      </>
    );
  }

  return <>Transaction Hash: {hash}</>;
}
