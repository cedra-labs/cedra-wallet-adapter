> **_NOTE:_** The feature is currently only available on DEVNET and is considered an alpha version; therefore, you can expect breaking changes.

# Derived Wallet Solana

A light-weight add-on package to the [@cedra-labs/wallet-adapter-react](../wallet-adapter-react/) that enables the functionality to use a Solana wallet as a Native Cedra Wallet

### How does Solana wallet work with the wallet adapter?

When a user connects to a dApp using a supported Solana wallet, the adapter computes the user's Derivable Abstracted Account (DAA) address and converts the Solana account to follow the Cedra wallet standard interface.
This ensures a seamless interaction with the wallet for both developers and end users.

The computation of the DAA address is done using the `authenticationFunction` and the `accountIdentity`, both of which are defined in this package:

- `authenticationFunction`: This is a function that exists on-chain and is used to verify the signature of EVM account. The function lives in `0x1::solana_derivable_account::authenticate`
- `accountIdentity`: This represents the identity of the account used in the on-chain authentication function to verify the signature of the EVM account.
  The EVM DAA account identity is in the format of:
  `${originWalletPublicKey}${domain}`

### How to integrate a Solana wallet in my dApp?

The wallet adapter follows the [Solana Wallet Standard](https://github.com/wallet-standard/wallet-standard/blob/master/DESIGN.md) to discover wallets.
Currently, the wallets that have been tested and support cross-chain accounts are:

|          | Cedra Devnet | Cedra Testnet | Cedra Mainnet |
| -------- | ------------ | ------------- | ------------- |
| Phantom  | ✅           |               |
| Solflare | ✅           |               |
| Backpack | ✅           |               |
| OKX      | ✅           |               |

### Usage

1. Install the [@cedra-labs/wallet-adapter-react](../wallet-adapter-react/) package

```bash
npm install @cedra-labs/wallet-adapter-react
```

2. Install the package `@cedra-labs/derived-wallet-solana`

```bash
npm install @cedra-labs/derived-wallet-solana
```

3. Import the automatic detection function

```tsx
import { CedraWalletAdapterProvider } from "@cedra-labs/wallet-adapter-react";
import { setupAutomaticSolanaWalletDerivation } from "@cedra-labs/derived-wallet-solana";

setupAutomaticSolanaWalletDerivation({ defaultNetwork: Network.DEVNET }); // Network.DEVNET is the Cedra network your dapp is working with

.....

<CedraWalletAdapterProvider
 dappConfig={{
    network: Network.DEVNET,
  }}
>
  {children}
<CedraWalletAdapterProvider/>
```

#### Submitting a transaction

In most cases, allowing users to submit a transaction with a Solana account to the Cedra chain requires using a sponsor transaction.
This is because the Solana account might not have APT to pay for gas.
Therefore, the dApp should consider maintaining a sponsor account to sponsor the transactions.

```tsx filename="SignAndSubmitDemo.tsx"
import React from "react";
import { useWallet } from "@cedra-labs/wallet-adapter-react";
import {
  Cedra,
  CedraConfig,
  Network,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
  Account,
} from "@cedra-labs/ts-sdk";

// Initialize an Cedra client
const config = new CedraConfig({ network: Network.DEVNET });
const cedra = new Cedra(config);

// Generate a sponsor account or use an existing account
const privateKey = new Ed25519PrivateKey(
  PrivateKey.formatPrivateKey("0x123", PrivateKeyVariants.Ed25519)
);
const sponsor = Account.fromPrivateKey({ privateKey });

const SignAndSubmit = () => {
  const { account, signTransaction } = useWallet();

  const onSignAndSubmitTransaction = async () => {
    if (!account) {
      throw new Error(
        "Account is not connected and unable to sign transaction"
      );
    }

    try {
      // Build the transaction
      const rawTransaction = await cedra.transaction.build.simple({
        data: {
          function: "0x1::cedra_account::transfer",
          functionArguments: [account.address.toString(), 1],
        },
        sender: account.address,
        withFeePayer: true,
      });

      // Send it to the wallet to sign
      const walletSignedTransaction = await signTransaction({
        transactionOrPayload: rawTransaction,
      });

      // Sponsor account signs the transaction to pay for the gas fees
      const sponsorAuthenticator = cedra.transaction.signAsFeePayer({
        signer: sponsor,
        transaction: rawTransaction,
      });

      // Submit the transaction to chain
      const txnSubmitted = await cedraClient(network).transaction.submit.simple(
        {
          transaction: rawTransaction,
          senderAuthenticator: walletSignedTransaction.authenticator,
          feePayerAuthenticator: sponsorAuthenticator,
        }
      );

      // if you want to wait for transaction
      await cedra.waitForTransaction({ transactionHash: txnSubmitted.hash });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={onSignAndSubmitTransaction}>
      Sign and submit transaction
    </button>
  );
};

export default SignAndSubmit;
```

### Considerations

- Since the origin wallet most likely not integrated with Cedra, simulation is not available in the wallet.
- The package retains the origin wallet, so developers should be able to use it and interact with it by:

```tsx
import { useWallet } from "@cedra-labs/wallet-adapter-react";

const { isSolanaDerivedWallet } = useWallet();

if (isSolanaDerivedWallet(wallet)) {
  const publicKey = wallet.solanaWallet.publicKey;
}
```

### Resources

- X-Chain Accounts Adapter Demo App
  - [Live site](https://cedra-labs.github.io/cedra-wallet-adapter/nextjs-cross-chain-example/)
  - [Source code](../../apps/nextjs-x-chain/)
- [AIP-113 Derivable Account Abstraction](https://github.com/cedra-foundation/AIPs/blob/main/aips/aip-113.md)
- [AIP-121 x-chain DAA authentication using Sign-in-With-Solana](https://github.com/cedra-foundation/AIPs/blob/main/aips/aip-121.md)
