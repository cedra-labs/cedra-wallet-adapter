"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { SingleSigner } from "@/components/transactionFlows/SingleSigner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Imports for registering a browser extension wallet plugin on page load
import { MyWallet } from "@/utils/standardWallet";
import { Network } from "@cedra-labs/ts-sdk";
import {
  OriginWalletDetails,
  useWallet,
} from "@cedra-labs/wallet-adapter-react";
import { registerWallet } from "@cedra-labs/wallet-standard";
import { init as initTelegram } from "@telegram-apps/sdk";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AccountBalance,
  CCTPTransfer,
  WalletConnection,
  WalletSelection,
} from "./components";

// Example of how to register a browser extension wallet plugin.
// Browser extension wallets should call registerWallet once on page load.
// When you click "Connect Wallet", you should see "Example Wallet"
(function () {
  if (typeof window === "undefined") return;
  const myWallet = new MyWallet();
  registerWallet(myWallet);
})();

const isTelegramMiniApp =
  typeof window !== "undefined" &&
  (window as any).TelegramWebviewProxy !== undefined;
if (isTelegramMiniApp) {
  initTelegram();
}

export default function Home() {
  const {
    account,
    connected,
    network,
    wallet,
    changeNetwork,
    getOriginWalletDetails,
  } = useWallet();

  const [originWalletDetails, setOriginWalletDetails] = useState<
    OriginWalletDetails | undefined
  >(undefined);

  useEffect(() => {
    if (!wallet) return;
    const fetchOriginWalletDetails = async () => {
      const details = await getOriginWalletDetails(wallet);
      setOriginWalletDetails(details);
    };
    void fetchOriginWalletDetails();
  }, [wallet, getOriginWalletDetails]);

  return (
    <main className="flex flex-col w-1/2 p-6 pb-12 md:px-8 gap-6">
      <div className="flex justify-between gap-6 pb-10">
        <div className="flex flex-col gap-2 md:gap-3">
          <h1 className="text-xl sm:text-3xl font-semibold tracking-tight">
            Cedra X-Chain Wallet Adapter Tester
            {network?.name ? ` — ${network.name}` : ""}
          </h1>
          <a
            href="https://github.com/cedra-labs/cedra-wallet-adapter/tree/main/apps/nextjs-x-chain-example"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground underline underline-offset-2 font-medium leading-none"
          >
            Demo App Source Code
          </a>
        </div>
        <ThemeToggle />
      </div>
      <WalletSelection />

      {connected && wallet && account && network && (
        <>
          <WalletConnection
            account={account}
            network={network}
            wallet={wallet}
            changeNetwork={changeNetwork}
            originWalletDetails={originWalletDetails}
          />
          {network?.name === Network.MAINNET && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                The transactions flows below will not work on the Mainnet
                network.
              </AlertDescription>
            </Alert>
          )}
          <AccountBalance account={account} network={network} wallet={wallet} />
          <SingleSigner />
          {network?.name !== Network.DEVNET && (
            <CCTPTransfer
              wallet={wallet}
              originWalletDetails={originWalletDetails}
            />
          )}
        </>
      )}
    </main>
  );
}
