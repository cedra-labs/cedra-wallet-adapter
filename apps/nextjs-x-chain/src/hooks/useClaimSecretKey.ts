import {
  Account,
  AccountAddress,
  Cedra,
  CedraConfig,
  Ed25519PrivateKey,
  Network,
} from "@cedra-labs/ts-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const claimSecretKeyStorageKey = "@wallet-adapter-example-dapp/claimSecretKey";

const config = new CedraConfig({ network: Network.TESTNET });
const cedra = new Cedra(config);

function getPersistedClaimSecretKey() {
  if (typeof window === "undefined") {
    return undefined;
  }

  const currentValue =
    window.localStorage.getItem(claimSecretKeyStorageKey) ?? undefined;
  if (currentValue) {
    return currentValue;
  }
  const newValue = Ed25519PrivateKey.generate().toString();
  window.localStorage.setItem(claimSecretKeyStorageKey, newValue);
  return newValue;
}

export function useClaimSecretKey() {
  const claimEnabled =
    typeof window !== "undefined" &&
    new URL(window.location.href).searchParams.get("claim") !== null;
  const claimSecretKey = claimEnabled
    ? getPersistedClaimSecretKey()
    : undefined;
  const claimAccountAddress = useMemo(() => {
    if (!claimSecretKey) {
      return undefined;
    }
    const secretKey = new Ed25519PrivateKey(claimSecretKey);
    const account = Account.fromPrivateKey({ privateKey: secretKey });
    return account.accountAddress;
  }, [claimSecretKey]);

  const { data: claimableBalance } = useQuery({
    queryKey: ["accounts", claimAccountAddress, "aptBalance"],
    queryFn: async () =>
      cedra.getAccountCoinAmount({
        accountAddress: claimAccountAddress!,
        coinType: "0x1::cedra_coin::CedraCoin",
      }),
    enabled: claimAccountAddress !== undefined,
  });

  const {
    isPending: isFunding,
    mutate: fundAccount,
    isSuccess: isFunded,
  } = useMutation({
    mutationFn: async (accountAddress: AccountAddress) =>
      cedra.fundAccount({
        accountAddress,
        amount: 1e8 - (claimableBalance ?? 0),
      }),
  });

  useEffect(() => {
    if (claimAccountAddress === undefined || claimableBalance === undefined) {
      return;
    }

    if (claimableBalance < 1e4 && !isFunded && !isFunding) {
      fundAccount(claimAccountAddress);
    }
  }, [
    claimAccountAddress,
    claimSecretKey,
    claimableBalance,
    fundAccount,
    isFunded,
    isFunding,
  ]);

  return claimSecretKey;
}
