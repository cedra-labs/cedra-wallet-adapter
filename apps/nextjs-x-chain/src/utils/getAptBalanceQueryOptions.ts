import {
  AccountAddressInput,
  Cedra,
  CedraConfig,
  Network,
} from "@cedra-labs/ts-sdk";
import { queryOptions } from "@tanstack/react-query";

export function getAptBalanceQueryOptions({
  accountAddress,
  network,
}: {
  accountAddress: AccountAddressInput;
  network: Network;
}) {
  return queryOptions({
    queryKey: [
      "networks",
      network,
      "accounts",
      accountAddress.toString(),
      "aptBalance",
    ],
    queryFn: async () => {
      const cedra = new Cedra(new CedraConfig({ network: network }));
      return cedra.getAccountCoinAmount({
        accountAddress,
        coinType: "0x1::cedra_coin::CedraCoin",
      });
    },
    gcTime: 60000, // 1 minute
    staleTime: 5000, // 5 seconds
  });
}
