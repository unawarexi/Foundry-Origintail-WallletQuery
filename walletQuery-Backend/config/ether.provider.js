// src/config/provider.js
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

/**
 * Ethereum provider setup with fallbacks and Etherscan API integration
 *
 * Supported providers in order of preference:
 * 1. Infura (recommended)
 * 2. Alchemy
 * 3. Etherscan
 * 4. Local RPC (e.g. Ganache, Hardhat)
 *
 * Example .env:
 * INFURA_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
 * ALCHEMY_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY
 * ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
 * LOCAL_RPC_URL=http://localhost:8545
 */

const providers = [];

// Add providers in order of preference
if (process.env.INFURA_URL) {
  providers.push(new ethers.JsonRpcProvider(process.env.INFURA_URL));
}

if (process.env.ALCHEMY_URL) {
  providers.push(new ethers.JsonRpcProvider(process.env.ALCHEMY_URL));
}

if (process.env.ETHERSCAN_API_KEY) {
  providers.push(new ethers.EtherscanProvider("homestead", process.env.ETHERSCAN_API_KEY));
}

if (process.env.LOCAL_RPC_URL) {
  providers.push(new ethers.JsonRpcProvider(process.env.LOCAL_RPC_URL));
}

if (providers.length === 0) {
  throw new Error("⚠️ No Ethereum provider URL found. Please set INFURA_URL, ALCHEMY_URL, ETHERSCAN_API_KEY, or LOCAL_RPC_URL in .env");
}

// Create fallback provider
const provider = providers.length > 1 ? new ethers.FallbackProvider(providers) : providers[0];

console.log(`✅ Ethereum provider initialized with ${providers.length} provider(s)`);

// Etherscan API configuration
export const etherscanConfig = {
  baseUrl: "https://api.etherscan.io/v2/api",
  apiKey: process.env.ETHERSCAN_API_KEY,
  chainId: 1, // Mainnet
  rateLimitDelay: 200, // 5 calls per second for free tier
};

/**
 * Make Etherscan API request with rate limiting
 */
export async function makeEtherscanRequest(params) {
  if (!etherscanConfig.apiKey) {
    throw new Error("Etherscan API key not configured");
  }

  const url = new URL(etherscanConfig.baseUrl);

  // Add default parameters
  url.searchParams.append("chainid", etherscanConfig.chainId);
  url.searchParams.append("apikey", etherscanConfig.apiKey);

  // Add custom parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === "0") {
      throw new Error(`Etherscan API error: ${data.message || "Unknown error"}`);
    }

    // Rate limiting delay
    await new Promise((resolve) => setTimeout(resolve, etherscanConfig.rateLimitDelay));

    return data;
  } catch (error) {
    console.error("Etherscan API request failed:", error.message);
    throw error;
  }
}

export default provider;
