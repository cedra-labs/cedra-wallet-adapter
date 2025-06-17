import { Cedra, CedraConfig, Network } from "@cedra-labs/ts-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  CedraMainnetUSDCToken,
  CedraTestnetUSDCToken,
  mainnetTokens,
  testnetTokens,
} from "../config";
import { ethers, JsonRpcProvider } from "ethers";

export const getSolanaWalletUSDCBalance = async (
  walletAddress: string,
  cedraNetwork: Network,
  rpc: string,
): Promise<string> => {
  const address = new PublicKey(walletAddress);
  const tokenAddress =
    cedraNetwork === Network.MAINNET
      ? mainnetTokens["Solana"].tokenId.address
      : testnetTokens["Solana"].tokenId.address;

  const connection = new Connection(rpc);
  // Check to see if we were passed wallet address or token account
  const splToken = await connection.getTokenAccountsByOwner(address, {
    mint: new PublicKey(tokenAddress),
  });

  // Use the first token account if it exists, otherwise fall back to wallet address
  const checkAddress =
    splToken.value.length > 0 ? splToken.value[0]!.pubkey : address;

  const balance = await connection.getTokenAccountBalance(checkAddress);

  return (
    balance.value.uiAmountString ??
    (Number(balance.value.amount) / 10 ** balance.value.decimals).toString()
  );
};

export const getEthereumWalletUSDCBalance = async (
  walletAddress: string,
  cedraNetwork: Network,
  rpc: string,
): Promise<string> => {
  const token =
    cedraNetwork === Network.MAINNET
      ? mainnetTokens["Ethereum"]
      : testnetTokens["Sepolia"];

  const tokenAddress = token.tokenId.address;
  const connection = new JsonRpcProvider(rpc);
  const abi = ["function balanceOf(address owner) view returns (uint256)"];
  const contract = new ethers.Contract(tokenAddress, abi, connection);
  const balance = await contract.balanceOf(walletAddress);
  return ethers.formatUnits(balance, token.decimals).toString();
};

export const getCedraWalletUSDCBalance = async (
  walletAddress: string,
  cedraNetwork: Network,
): Promise<string> => {
  const token =
    cedraNetwork === Network.MAINNET
      ? CedraMainnetUSDCToken
      : CedraTestnetUSDCToken;
  const tokenAddress = token.tokenId.address;
  const cedraConfig = new CedraConfig({ network: cedraNetwork });
  const connection = new Cedra(cedraConfig);
  const response = await connection.getCurrentFungibleAssetBalances({
    options: {
      where: {
        owner_address: { _eq: walletAddress },
        asset_type: { _eq: tokenAddress },
      },
    },
  });
  const balance = (
    Number(response[0].amount) /
    10 ** token.decimals
  ).toString();
  return balance;
};
