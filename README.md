> **_NOTE:_** This README is for Wallet Adapter `v3` and up. For Wallet Adapter `v2` refer to [this guide](./READMEV2.md)

# Cedra Wallet Adapter

A monorepo modular wallet adapter developed and maintained by Cedra for wallet and dapp builders.

#### Getting Started

- [Wallet Adapter Docs](https://cedra.dev/en/build/sdks/wallet-adapter)
- [Example app](https://github.com/cedra-labs/cedra-wallet-adapter/tree/main/apps/nextjs-example)
- [For Cedra Dapps](https://github.com/cedra-labs/cedra-wallet-adapter/tree/main/packages/wallet-adapter-react)
- [For Cedra Wallets](https://cedra.dev/en/build/sdks/wallet-adapter/browser-extension-wallets)
- [Core package](https://github.com/cedra-labs/cedra-wallet-adapter/tree/main/packages/wallet-adapter-core)
- [Wallet connect UI package](./packages/wallet-adapter-react/READMEV2.md#use-a-ui-package-recommended)

#### [AIP-62](https://github.com/cedra-foundation/AIPs/blob/main/aips/aip-62.md) Supported wallet

> **_NOTE:_** These are in alphabetical order, any new wallets must be in alphabetical order

- [CedraConnect](https://cedraconnect.app/)
- [Mizu](https://www.mizu.io/)
- [MSafe](https://www.npmjs.com/package/@msafe/cedra-wallet-adapter)
- [Nightly](https://chromewebstore.google.com/detail/nightly/fiikommddbeccaoicoejoniammnalkfa)
- [OKX](https://www.npmjs.com/package/@okwallet/cedra-wallet-adapter)
- [Petra](https://chromewebstore.google.com/detail/petra-cedra-wallet/ejjladinnckdgjemekebdpeokbikhfci?hl=en)
- [Pontem](https://www.npmjs.com/package/@pontem/wallet-adapter-plugin)
- [RimoSafe](https://chromewebstore.google.com/detail/rimo-safe-wallet/kiicddjcakdmobjkcpppkgcjbpakcagp)
- T wallet

#### Develop Locally

You would need `pnpm@9.15.5` in order to bootstrap and test a local copy of this repo.

1. Clone the repo with `git clone https://github.com/cedra-labs/cedra-wallet-adapter.git`
2. On the root folder, run `pnpm install` and `pnpm turbo run build`
3. On the root folder, run `pnpm turbo run dev` - that would spin up a local server (`https://localhost:3000`) with the `nextjs` demoapp

Looking how you can contribute? Take a look at our [contribution guide](./CONTRIBUTING.md)

#### Terms of Use and Privacy Policy

By accessing or using the wallet adapter, you agree to be bound to the Cedra Labs [Terms of Use](https://cedralabs.com/terms) and [Privacy Policy](https://cedralabs.com/privacy).
