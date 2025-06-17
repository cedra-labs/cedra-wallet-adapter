> **_NOTE:_** This documentation is for Wallet Adapter `v^1.*.*`

# Wallet Adapter React Provider

A react provider wrapper for the Cedra Wallet Adapter

Dapps that want to use the adapter should install this package and other supported wallet packages.

### Support

The react provider supports all [wallet standard](https://cedra.dev/guides/wallet-standard) functions and feature functions

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

Wrap your app with the Provider, pass it the `plugins (wallets)` you want to have on your app as an array and a `autoConnect` option (set to false by default)

```js
const wallets = [new CedraWallet()];

<CedraWalletAdapterProvider
  plugins={wallets}
  autoConnect={true}
  onError={(error) => {
    console.log("error", error);
  }}
>
  <App />
</CedraWalletAdapterProvider>;
```

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
You can find it [here](../wallet-adapter-ant-design/) with instructions on how to use it.

#### Examples

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
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::cedra_coin::CedraCoin"],
      arguments: [account?.address, 1], // 1 is in Octas
    };
    const response = await signAndSubmitTransaction(payload);
    // if you want to wait for transaction
    try {
      await cedraClient.waitForTransaction(response?.hash || "");
    } catch (error) {
      console.error(error);
    }
  };

<button onClick={onSignAndSubmitTransaction}>
  Sign and submit transaction
</button>
```

##### signAndSubmitBCSTransaction(payload)

```js
   const onSignAndSubmitBCSTransaction = async () => {
    const token = new TxnBuilderTypes.TypeTagStruct(
      TxnBuilderTypes.StructTag.fromString("0x1::cedra_coin::CedraCoin")
    );
    const entryFunctionBCSPayload =
      new TxnBuilderTypes.TransactionPayloadEntryFunction(
        TxnBuilderTypes.EntryFunction.natural(
          "0x1::coin",
          "transfer",
          [token],
          [
            BCS.bcsToBytes(
              TxnBuilderTypes.AccountAddress.fromHex(account!.address)
            ),
            BCS.bcsSerializeUint64(2),
          ]
        )
      );

    const response = await signAndSubmitBCSTransaction(entryFunctionBCSPayload);
    // if you want to wait for transaction
    try {
      await cedraClient.waitForTransaction(response?.hash || "");
    } catch (error) {
      console.error(error);
    }
  };

<button onClick={onSignAndSubmitTransaction}>
  Sign and submit BCS transaction
</button>
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
    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::cedra_coin::CedraCoin"],
      arguments: [account?.address, 1], // 1 is in Octas
    };
    const response = await signTransaction(payload);
  };

<button onClick={onSignTransaction}>
  Sign transaction
</button>
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
