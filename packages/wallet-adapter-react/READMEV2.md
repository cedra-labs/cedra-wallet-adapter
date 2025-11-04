This README is for the `@cedra-labs/wallet-adapter-react v3.*.*`

> **_NOTE:_** This documentation is for Wallet Adapter `v2.0.0` and up that is fully compatible with the Cedra TypeScript SDK V2. For Wallet Adapter `v^1.*.*` refer to [this guide](./READMEV1.md)

# Wallet Adapter React Provider

A react provider wrapper for the Cedra Wallet Adapter

Dapps that want to use the adapter should install this package and other supported wallet packages.

### Support

The react provider supports all [wallet standard](https://cedra.dev/integration/wallet-adapter-for-wallets#aip-62-wallet-standard) functions and feature functions

##### Standard functions

```
connect
disconnect
connected
account
network
signAndSubmitTransaction
signMessage
```

##### Feature functions - functions that may not be supported by all wallets

```
signTransaction
signMessageAndVerify
signAndSubmitBCSTransaction
submitTransaction
```

### Usage

#### Install Dependencies

Install wallet dependencies you want to include in your app.
To do that, you can look at our [supported wallets list](https://github.com/cedra-labs/cedra-wallet-adapter#supported-wallet-packages). Each wallet is a link to npm package where you can install it from.

Next, install the `@cedra-labs/wallet-adapter-react`

```
pnpm i @cedra-labs/wallet-adapter-react
```

using npm

```
npm i @cedra-labs/wallet-adapter-react
```

#### Import dependencies

On the `App.jsx` file,

Import the installed wallets.

```js
import { SomeCedraWallet } from "some-cedra-wallet-package";
```

Import the `CedraWalletAdapterProvider`.

```js
import { CedraWalletAdapterProvider } from "@cedra-labs/wallet-adapter-react";
```

Wrap your app with the Provider, pass it the relevant props.

```js
const wallets = [new CedraLegacyStandardWallet()];

<CedraWalletAdapterProvider
  plugins={wallets}
  autoConnect={true}
  optInWallets={["Nightly"]}
  dappConfig={{ network: network.MAINNET, cedraApiKey: "my-generated-api-key" }}
  onError={(error) => {
    console.log("error", error);
  }}
>
  <App />
</CedraWalletAdapterProvider>;
```

#### Available Provider Props

- `dappConfig` - Config used to initialize the dapp with.
  - `network` - the network the dapp works with
  - `cedraApiKey` - an api key generated from https://developers.cedralabs.com/docs/api-access
- `onError` - a callback function to fire when the adapter throws an error
- `plugins` - any legacy standard wallet, i.e a wallet that is not AIP-62 standard compatible, should be installed and passed in this array. [Check here](../../README.md#supported-wallet-packages) for a list of AIP-62 and legacy standard wallets.
- `autoConnect` - a prop indicates whether the dapp should auto connect with a previous connected wallet.
- `optInWallets` - the adapter detects and adds AIP-62 standard wallets by default, sometimes you might want to opt-in with specific wallets. This props lets you define the AIP-62 standard wallets you want to support in your dapp.
- `disableTelemetry` - A boolean flag to disable the adapter telemetry tool, false by default

#### Use Wallet

On any page you want to use the wallet props, import `useWallet` from `@cedra-labs/wallet-adapter-react`

```js
import { useWallet } from "@cedra-labs/wallet-adapter-react";
```

Then you can use the exported properties

```js
const {
  connect,
  account,
  network,
  connected,
  disconnect,
  wallet,
  wallets,
  signAndSubmitTransaction,
  signAndSubmitBCSTransaction,
  signTransaction,
  signMessage,
  signMessageAndVerify,
} = useWallet();
```

### Use a UI package (recommended)

As part of the wallet adapter repo we provide a wallet connect UI package that provides a wallet connect button and a wallet select modal.

The available UI Packages are

- [shadcn/ui](../../apps/nextjs-example/README.md#use-shadcnui-wallet-selector-for-your-own-app)
- [Ant Design](<(../wallet-adapter-ant-design/)>)
- [MUI](../wallet-adapter-mui-design/)

If you want to create your own wallet selector UI from existing components and styles in your app, `@cedra-labs/wallet-adapter-react` provides a series of headless components and utilities to simplify this process so that you can focus on writing CSS instead of implementing business logic. For more information, check out the [Building Your Own Wallet Selector](./docs/BYO-wallet-selector.md) document.

#### Examples

##### Initialize Cedra

```js
const cedraConfig = new CedraConfig({ network: Network.MAINNET });
const cedra = new Cedra(cedraConfig);
```

##### connect(walletName)

```js
const onConnect = async (walletName) => {
  await connect(walletName);
};

<button onClick={() => onConnect(wallet.name)}>{wallet.name}</button>;
```

##### disconnect()

```js
<button onClick={disconnect}>Disconnect</button>
```

##### signAndSubmitTransaction(payload)

```js
const onSignAndSubmitTransaction = async () => {
  const response = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: "0x1::coin::transfer",
      typeArguments: ["0x1::cedra_coin::CedraCoin"],
      functionArguments: [account.address, 1],
    },
  });
  // if you want to wait for transaction
  try {
    await cedra.waitForTransaction({ transactionHash: response.hash });
  } catch (error) {
    console.error(error);
  }
};

<button onClick={onSignAndSubmitTransaction}>
  Sign and submit transaction
</button>;
```

##### signAndSubmitBCSTransaction(payload)

```js
const onSignAndSubmitBCSTransaction = async () => {
  const response = await signAndSubmitTransaction({
    sender: account.address,
    data: {
      function: "0x1::coin::transfer",
      typeArguments: [parseTypeTag(CEDRA_COIN)],
      functionArguments: [AccountAddress.from(account.address), new U64(1)],
    },
  });
  // if you want to wait for transaction
  try {
    await cedra.waitForTransaction({ transactionHash: response.hash });
  } catch (error) {
    console.error(error);
  }
};

<button onClick={onSignAndSubmitTransaction}>
  Sign and submit BCS transaction
</button>;
```

##### signMessage(payload)

```js
const onSignMessage = async () => {
  const payload = {
    message: "Hello from Cedra Wallet Adapter",
    nonce: "random_string",
  };
  const response = await signMessage(payload);
};

<button onClick={onSignMessage}>Sign message</button>;
```

##### Account

```js
<div>{account?.address}</div>
<div>{account?.publicKey}</div>
```

##### Network

```js
<div>{network?.name}</div>
```

##### Wallet

```js
<div>{wallet?.name}</div>
<div>{wallet?.icon}</div>
<div>{wallet?.url}</div>
```

##### Wallets

```js
{
  wallets.map((wallet) => <p>{wallet.name}</p>);
}
```

##### signTransaction(payload)

```js
const onSignTransaction = async () => {
  const payload = {
    type: "entry_function_payload",
    function: "0x1::coin::transfer",
    type_arguments: ["0x1::cedra_coin::CedraCoin"],
    arguments: [account?.address, 1], // 1 is in Octas
  };
  const response = await signTransaction(payload);
};

<button onClick={onSignTransaction}>Sign transaction</button>;
```

##### signMessageAndVerify(payload)

```js
const onSignMessageAndVerify = async () => {
  const payload = {
    message: "Hello from Cedra Wallet Adapter",
    nonce: "random_string",
  };
  const response = await signMessageAndVerify(payload);
};

<button onClick={onSignMessageAndVerify}>Sign message and verify</button>;
```
