// src/services/nfts.service.js
import opensea from "@api/opensea";
import provider from "../config/provider.js";
import { ethers } from "ethers";

class NFTService {
  constructor() {
    // Initialize OpenSea with API key from environment
    if (process.env.OPENSEA_API_KEY) {
      opensea.auth(process.env.OPENSEA_API_KEY);
    } else {
      console.warn("OPENSEA_API_KEY not found in environment variables");
    }
  }

  /**
   * Validate Ethereum address format
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Get all collections from OpenSea
   * @param {number} limit - Number of collections to return (1-200, default: 50)
   * @param {string} next - Cursor for pagination
   */
  async getAllCollections(limit = 50, next = null) {
    try {
      const params = { limit };
      if (next) params.next = next;

      const response = await opensea.list_collections(params);

      return {
        success: true,
        data: response.data,
        pagination: {
          next: response.data.next || null,
          limit: limit,
        },
      };
    } catch (error) {
      console.error("Error fetching collections:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch collections",
        data: null,
      };
    }
  }

  /**
   * Get NFTs by account address
   * @param {string} address - Ethereum wallet address
   * @param {string} chain - Blockchain network (default: ethereum)
   * @param {number} limit - Number of NFTs to return (1-200, default: 50)
   * @param {string} next - Cursor for pagination
   */
  async getNFTsByAccount(address, chain = "ethereum", limit = 50, next = null) {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error("Invalid Ethereum address format");
      }

      const params = {
        chain,
        address: address.toLowerCase(),
        limit,
      };
      if (next) params.next = next;

      const response = await opensea.list_nfts_by_account(params);

      return {
        success: true,
        data: response.data,
        account: address,
        chain: chain,
        pagination: {
          next: response.data.next || null,
          limit: limit,
        },
      };
    } catch (error) {
      console.error("Error fetching NFTs by account:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch NFTs for account",
        data: null,
      };
    }
  }

  /**
   * Get NFTs by collection slug
   * @param {string} collectionSlug - OpenSea collection slug
   * @param {number} limit - Number of NFTs to return (1-200, default: 50)
   * @param {string} next - Cursor for pagination
   */
  async getNFTsByCollection(collectionSlug, limit = 50, next = null) {
    try {
      if (!collectionSlug || typeof collectionSlug !== "string") {
        throw new Error("Valid collection slug is required");
      }

      const params = {
        collection_slug: collectionSlug,
        limit,
      };
      if (next) params.next = next;

      const response = await opensea.list_nfts_by_collection(params);

      return {
        success: true,
        data: response.data,
        collection: collectionSlug,
        pagination: {
          next: response.data.next || null,
          limit: limit,
        },
      };
    } catch (error) {
      console.error("Error fetching NFTs by collection:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch NFTs for collection",
        data: null,
      };
    }
  }

  /**
   * Get collections owned by a specific account
   * This combines getting NFTs by account and extracting unique collections
   */
  async getCollectionsByAccount(address, chain = "ethereum", limit = 200) {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error("Invalid Ethereum address format");
      }

      const nftsResponse = await this.getNFTsByAccount(address, chain, limit);

      if (!nftsResponse.success) {
        return nftsResponse;
      }

      // Extract unique collections from NFTs
      const collections = new Map();

      if (nftsResponse.data.nfts && Array.isArray(nftsResponse.data.nfts)) {
        nftsResponse.data.nfts.forEach((nft) => {
          if (nft.collection && !collections.has(nft.collection)) {
            collections.set(nft.collection, {
              collection: nft.collection,
              contract: nft.contract,
              token_standard: nft.token_standard,
              sample_nft: {
                name: nft.name,
                image_url: nft.image_url,
                opensea_url: nft.opensea_url,
              },
            });
          }
        });
      }

      return {
        success: true,
        data: {
          collections: Array.from(collections.values()),
          total_collections: collections.size,
          total_nfts: nftsResponse.data.nfts ? nftsResponse.data.nfts.length : 0,
        },
        account: address,
        chain: chain,
      };
    } catch (error) {
      console.error("Error fetching collections by account:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch collections for account",
        data: null,
      };
    }
  }

  /**
   * Get blockchain info for an address using our Ethereum provider
   */
  async getAddressInfo(address) {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error("Invalid Ethereum address format");
      }

      const balance = await provider.getBalance(address);
      const txCount = await provider.getTransactionCount(address);

      return {
        success: true,
        data: {
          address: address,
          balance: ethers.formatEther(balance),
          transactionCount: txCount,
          isContract: (await provider.getCode(address)) !== "0x",
        },
      };
    } catch (error) {
      console.error("Error fetching address info:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch address information",
        data: null,
      };
    }
  }
}

export default new NFTService();
