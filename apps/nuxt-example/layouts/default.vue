<script setup lang="ts">
useHead({
  title: "Cedra Wallet Adapter Example",
  meta: [
    {
      name: "description",
      content:
        "An example of how to use Cedra Wallet Adapter with Vue and Nuxt.js.",
    },
  ],
  bodyAttrs: {
    class:
      "flex justify-center min-h-screen bg-background font-sans antialiased text-card-foreground",
    style: "font-family: 'Inter', sans-serif;",
  },
});
</script>

<template>
  <slot />
</template>
