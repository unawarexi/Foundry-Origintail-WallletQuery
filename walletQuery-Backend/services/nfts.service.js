// src/services/nfts.service.js
import opensea from "@api/opensea";
import provider from "../config/ether.provider.js";
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

  async getAllCollections(limit = 50, next = null) {
    try {
      const params = { limit };
      if (next) params.next = next;

      const response = await opensea.list_collections(params);

      // Return the full response structure as documented
      return {
        success: true,
        data: response.data, // Full collections response with all fields
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

      // Return the full response structure as documented
      return {
        success: true,
        data: response.data, // Full NFTs response with all fields
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

      // Return the full response structure as documented
      return {
        success: true,
        data: response.data, // Full NFTs response with all fields
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
   * Get collections by account - now returns full collection data
   * This method gets unique collections from user's NFTs and then fetches full collection details
   */
  async getCollectionsByAccount(address, chain = "ethereum", limit = 200) {
    try {
      if (!this.isValidAddress(address)) {
        throw new Error("Invalid Ethereum address format");
      }

      // First, get all NFTs for the account
      const nftsResponse = await this.getNFTsByAccount(address, chain, limit);

      if (!nftsResponse.success) {
        return nftsResponse;
      }

      // Extract unique collection slugs from NFTs
      const uniqueCollections = new Set();
      const collectionToNftMap = new Map(); // Map to track NFTs per collection

      if (nftsResponse.data.nfts && Array.isArray(nftsResponse.data.nfts)) {
        nftsResponse.data.nfts.forEach((nft) => {
          if (nft.collection) {
            uniqueCollections.add(nft.collection);

            // Track NFTs per collection for additional context
            if (!collectionToNftMap.has(nft.collection)) {
              collectionToNftMap.set(nft.collection, []);
            }
            collectionToNftMap.get(nft.collection).push(nft);
          }
        });
      }
      const collectionsArray = Array.from(uniqueCollections).map((collectionSlug) => {
        const nftsInCollection = collectionToNftMap.get(collectionSlug) || [];
        const sampleNft = nftsInCollection[0]; // Use first NFT as sample

        // Structure the response to match OpenSea's collection format
        return {
          collection: collectionSlug,
          name: sampleNft ? sampleNft.name?.split("#")[0]?.trim() || collectionSlug : collectionSlug,
          description: sampleNft ? sampleNft.description || "" : "",
          image_url: sampleNft ? sampleNft.image_url || "" : "",
          banner_image_url: "",
          owner: address, // The queried address owns NFTs from this collection
          safelist_status: {},
          category: "",
          is_disabled: sampleNft ? sampleNft.is_disabled || false : false,
          is_nsfw: sampleNft ? sampleNft.is_nsfw || false : false,
          trait_offers_enabled: true,
          collection_offers_enabled: true,
          opensea_url: sampleNft ? sampleNft.opensea_url?.split("/").slice(0, -1).join("/") || "" : "",
          project_url: "",
          wiki_url: "",
          discord_url: "",
          telegram_url: "",
          twitter_username: "",
          instagram_username: "",
          contracts: sampleNft ? [{ address: sampleNft.contract }] : [],
          // Additional fields for context
          nft_count: nftsInCollection.length,
          sample_nfts: nftsInCollection.slice(0, 3), // Include up to 3 sample NFTs
        };
      });

      // Return in the same format as getAllCollections
      return {
        success: true,
        data: {
          collections: collectionsArray,
          next: nftsResponse.data.next || null, 
        },
        account: address,
        chain: chain,
        metadata: {
          total_collections: collectionsArray.length,
          total_nfts: nftsResponse.data.nfts ? nftsResponse.data.nfts.length : 0,
        },
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
