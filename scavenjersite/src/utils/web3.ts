import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import { POLYGON_RPC_URL, PRIVATE_KEY, THIRDWEB_CLIENT_ID } from "../config/constants";

export const initializeSDK = () => {
  if (!POLYGON_RPC_URL || !PRIVATE_KEY || !THIRDWEB_CLIENT_ID) {
    throw new Error("Missing environment variables");
  }

  const provider = new ethers.providers.JsonRpcProvider(POLYGON_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  return new ThirdwebSDK(wallet, {
    clientId: THIRDWEB_CLIENT_ID,
  });
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEther = (wei: ethers.BigNumberish): string => {
  return ethers.utils.formatEther(wei);
};