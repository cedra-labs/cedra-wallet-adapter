> **_NOTE:_** Use the Wallet Adapter v2.0.0 and up with the new Cedra TypeScript SDK [@cedra-labs/ts-sdk](https://www.npmjs.com/package/@cedra-labs/ts-sdk)

# Cedra Wallet Adapter

A monorepo modular wallet adapter developed and maintained by Cedra for wallet and dapp builders that includes:

#### Getting Started

- [Example app](https://github.com/cedra-labs/cedra-wallet-adapter/tree/main/apps/nextjs-example)
- [For Cedra Dapps](https://github.com/cedra-labs/cedra-wallet-adapter/tree/main/packages/wallet-adapter-react/READMEV2.md)
- [For Cedra Wallets](https://github.com/identity-connect/wallet-adapter-plugin-template)
- [Core package](https://github.com/cedra-labs/cedra-wallet-adapter/tree/main/packages/wallet-adapter-core)
- [Wallet connect UI package](https://github.com/cedra-labs/cedra-wallet-adapter/tree/main/packages/wallet-adapter-ant-design)

#### Supported wallet packages

Note: These are in alphabetical order, any new wallets must be in alphabetical order

[AIP-62](https://github.com/cedra-foundation/AIPs/blob/main/aips/aip-62.md) standard compatible

- [CedraConnect](https://cedraconnect.app/)
- [Mizu](https://www.mizu.io/)
- [MizuWallet](https://www.npmjs.com/package/@mizuwallet-sdk/cedra-wallet-adapter)
- [MSafe](https://www.npmjs.com/package/@msafe/cedra-wallet-adapter)
- [Nightly](https://chromewebstore.google.com/detail/nightly/fiikommddbeccaoicoejoniammnalkfa)
- [OKX](https://www.npmjs.com/package/@okwallet/cedra-wallet-adapter)
- [Petra](https://chromewebstore.google.com/detail/petra-cedra-wallet/ejjladinnckdgjemekebdpeokbikhfci?hl=en)
- [Pontem](https://www.npmjs.com/package/@pontem/wallet-adapter-plugin)
- T wallet

Legacy standard compatible

- [BitgetWallet](https://www.npmjs.com/package/@bitget-wallet/cedra-wallet-adapter)
- [Fewcha](https://www.npmjs.com/package/fewcha-plugin-wallet-adapter)
- [Martian](https://www.npmjs.com/package/@martianwallet/cedra-wallet-adapter)
- [Trust](https://www.npmjs.com/package/@trustwallet/cedra-wallet-adapter)

#### Develop Locally

You would need `pnpm@7.14.2` in order to bootstrap and test a local copy of this repo.

1. Clone the repo with `git clone https://github.com/cedra-labs/cedra-wallet-adapter.git`
2. On the root folder, run `pnpm install` and `pnpm turbo run build`
3. On the root folder, run `pnpm turbo run dev` - that would spin up a local server (`localhost:3000`) with the `nextjs` demoapp

Looking how you can contribute? Take a look at our [contribution guide](./CONTRIBUTING.md)

#### Terms of Use and Privacy Policy

By accessing or using the wallet adapter, you agree to be bound to the Cedra Labs [Terms of Use](https://cedralabs.com/terms) and [Privacy Policy](https://cedralabs.com/privacy).
