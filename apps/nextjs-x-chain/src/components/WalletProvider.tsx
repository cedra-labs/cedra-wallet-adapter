"use client";

import { CedraWalletAdapterProvider } from "@cedra-labs/wallet-adapter-react";
import { setupAutomaticEthereumWalletDerivation } from "@cedra-labs/derived-wallet-ethereum";
import { setupAutomaticSolanaWalletDerivation } from "@cedra-labs/derived-wallet-solana";
import { PropsWithChildren } from "react";
import { Network } from "@cedra-labs/ts-sdk";
import { useClaimSecretKey } from "@/hooks/useClaimSecretKey";
import { useAutoConnect } from "./AutoConnectProvider";
import { useToast } from "./ui/use-toast";

setupAutomaticEthereumWalletDerivation({ defaultNetwork: Network.DEVNET });
setupAutomaticSolanaWalletDerivation({ defaultNetwork: Network.DEVNET });

let dappImageURI: string | undefined;
if (typeof window !== "undefined") {
  dappImageURI = `${window.location.origin}${window.location.pathname}favicon.ico`;
}

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { autoConnect } = useAutoConnect();
  const { toast } = useToast();

  // Enables claim flow when the `claim` query param is detected
  const claimSecretKey = useClaimSecretKey();

  return (
    <CedraWalletAdapterProvider
      autoConnect={autoConnect}
      dappConfig={{
        network: Network.TESTNET,
        cedraApiKeys: {
          testnet: process.env.NEXT_PUBLIC_CEDRA_API_KEY_TESNET,
          devnet: process.env.NEXT_PUBLIC_CEDRA_API_KEY_DEVNET,
        },
        cedraConnect: {
          claimSecretKey,
          dappId: "57fa42a9-29c6-4f1e-939c-4eefa36d9ff5",
          dappImageURI,
        },
        mizuwallet: {
          manifestURL:
            "https://assets.mz.xyz/static/config/mizuwallet-connect-manifest.json",
        },
      }}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </CedraWalletAdapterProvider>
  );
};
