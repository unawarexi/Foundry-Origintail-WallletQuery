// Connects to Ethereum (via Infura/Etherscan using ethers.js).

// src/config/provider.js
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

/**
 * Ethereum provider setup
 * 
 * Supported:
 * - Infura (recommended)
 * - Alchemy
 * - Local RPC (e.g. Ganache, Hardhat)
 * 
 * Example .env:
 * INFURA_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
 */
let provider;

if (process.env.INFURA_URL) {
  provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
} else if (process.env.ALCHEMY_URL) {
  provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);
} else if (process.env.LOCAL_RPC_URL) {
  provider = new ethers.JsonRpcProvider(process.env.LOCAL_RPC_URL);
} else {
  throw new Error("❌ No Ethereum provider URL found. Please set INFURA_URL, ALCHEMY_URL, or LOCAL_RPC_URL in .env");
}

export default provider;
