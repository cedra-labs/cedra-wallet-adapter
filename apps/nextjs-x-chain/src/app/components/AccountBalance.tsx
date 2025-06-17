import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAptBalanceQueryOptions } from "@/utils/getAptBalanceQueryOptions";
import { Cedra, CedraConfig, Network } from "@cedra-labs/ts-sdk";
import {
  AccountInfo,
  AdapterWallet,
  NetworkInfo,
} from "@cedra-labs/wallet-adapter-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface AccountBalanceProps {
  account: AccountInfo;
  network: NetworkInfo;
  wallet: AdapterWallet;
}

export function AccountBalance({ account, network }: AccountBalanceProps) {
  const aptBalance = useQuery({
    ...getAptBalanceQueryOptions({
      accountAddress: account.address,
      network: network.name,
    }),
    refetchInterval: 10000, // 10 seconds
  });

  const { mutateAsync: fundAccount, isPending: isFunding } = useMutation({
    mutationFn: async () => {
      const cedra = new Cedra(new CedraConfig({ network: network.name }));
      await cedra.fundAccount({
        accountAddress: account.address,
        amount: 0.1e8,
      });
    },
    onSuccess: () => {
      void aptBalance.refetch();
    },
  });

  const balanceSection = useMemo(() => {
    if (aptBalance.status === "pending") {
      return <span>Fetching...</span>;
    }
    if (aptBalance.status === "error") {
      return <span>Error</span>;
    }

    const formattedAmount = (aptBalance.data * 1e-8).toFixed(4);
    return <span>{formattedAmount} APT</span>;
  }, [aptBalance.status, aptBalance.data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-between w-full">
          {balanceSection}
          <Button
            onClick={() => fundAccount()}
            disabled={network.name !== Network.DEVNET || isFunding}
          >
            Fund account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
