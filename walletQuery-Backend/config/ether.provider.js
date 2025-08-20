// src/config/provider.js
import { ethers } from "ethers";
import opensea from "@api/opensea";
import dotenv from "dotenv";
dotenv.config();

/**
 * Ethereum provider setup with fallbacks and API integrations
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
 * OPENSEA_API_KEY=YOUR_OPENSEA_API_KEY
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

// OpenSea API configuration
export const openseaConfig = {
  apiKey: process.env.OPENSEA_API_KEY,
  baseUrl: "https://api.opensea.io/v2",
  rateLimitDelay: 100, // 10 calls per second for basic plan
  supported_chains: ["ethereum", "polygon", "klaytn", "bsc", "solana", "arbitrum", "arbitrum_nova", "arbitrum_sepolia", "avalanche",
    "optimism", "base", "blast", "sei", "zora", "sepolia", "base_sepolia"],
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

/**
 * Initialize OpenSea API if key is provided
 */
function initializeOpenSea() {
  if (openseaConfig.apiKey) {
    try {
      opensea.auth(openseaConfig.apiKey);
      console.log("✅ OpenSea API initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize OpenSea API:", error.message);
      return false;
    }
  } else {
    console.warn("⚠️ OPENSEA_API_KEY not found in environment variables");
    return false;
  }
}

// Initialize OpenSea on module load
const openseaInitialized = initializeOpenSea();

export function isValidAddress(address) {
  return ethers.isAddress(address);
}

export function formatEther(wei) {
  return ethers.formatEther(wei);
}

export function parseEther(ether) {
  return ethers.parseEther(ether.toString());
}

export async function getNetworkInfo() {
  try {
    const network = await provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name,
      ensAddress: network.ensAddress,
    };
  } catch (error) {
    console.error("Error getting network info:", error);
    throw error;
  }
}

export function isSupportedChain(chain) {
  return openseaConfig.supported_chains.includes(chain.toLowerCase());
}

// Export configurations and provider
export { openseaInitialized };
export default provider;
