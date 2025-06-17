<script setup lang="ts">
import {
  AnyCedraWallet,
  WalletItem,
  WalletIcon,
  WalletName,
} from "@cedra-labs/wallet-adapter-vue";

interface Props {
  wallet: AnyCedraWallet;
  onConnect: () => void;
}

defineProps<Props>();
defineEmits(["connect"]);
</script>

<template>
  <WalletItem :wallet="wallet" :onConnect="onConnect">
    <template #connectButton>
      <Button size="lg" variant="outline" class="w-full gap-4">
        <WalletIcon class="h-5 w-5" :icon="wallet?.icon" :name="wallet?.name" />
        <WalletName class="text-base font-normal" :name="wallet?.name" />
      </Button>
    </template>
  </WalletItem>
</template>
