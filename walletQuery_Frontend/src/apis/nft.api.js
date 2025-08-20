// src/apis/nft.api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/nfts",
  timeout: 120000, // 2 minute timeout for blockchain queries
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`NFT API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error("NFT API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`NFT API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error("NFT API Response Error:", error.response?.data || error.message);

    // Enhanced error messages
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout - NFT API may be slow");
    } else if (error.response?.status === 429) {
      throw new Error("Rate limit exceeded - please wait before making another request");
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || "Invalid request parameters");
    } else if (error.response?.status === 404) {
      throw new Error("NFT endpoint not found - please check your API configuration");
    } else if (error.response?.status >= 500) {
      throw new Error("NFT server error - please try again later");
    }

    return Promise.reject(error);
  }
);

// ===== HEALTH CHECK =====

/**
 * Check NFT API health status
 */
export const checkNFTAPIHealth = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("Error checking NFT API health:", error);
    throw new Error(error.response?.data?.error || "Failed to check NFT API health");
  }
};

// ===== COLLECTIONS =====

export const getAllCollections = async (limit = 50, next = null) => {
  try {
    const params = { limit };
    if (next) params.next = next;

    const response = await api.get("/collections", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching all collections:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch collections");
  }
};


export const getCollectionsByAccount = async (address, chain = "ethereum", limit = 200) => {
  try {
    if (!address) {
      throw new Error("Address is required");
    }

    const params = { chain, limit };
    const response = await api.get(`/account/${address}/collections`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching collections by account:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch collections for account");
  }
};


export const getNFTsByCollection = async (collectionSlug, limit = 50, next = null) => {
  try {
    if (!collectionSlug) {
      throw new Error("Collection slug is required");
    }

    const params = { limit };
    if (next) params.next = next;

    const response = await api.get(`/collection/${collectionSlug}`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching NFTs by collection:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch NFTs for collection");
  }
};

// ===== ACCOUNT NFTs =====

export const getNFTsByAccount = async (address, chain = "ethereum", limit = 50, next = null) => {
  try {
    if (!address) {
      throw new Error("Address is required");
    }

    const params = { chain, limit };
    if (next) params.next = next;

    const response = await api.get(`/account/${address}`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching NFTs by account:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch NFTs for account");
  }
};

export const getAccountNFTData = async (address, chain = "ethereum", nftLimit = 100, collectionLimit = 200) => {
  try {
    if (!address) {
      throw new Error("Address is required");
    }

    // Fetch both NFTs and collections in parallel
    const [nftsResponse, collectionsResponse] = await Promise.allSettled([getNFTsByAccount(address, chain, nftLimit), getCollectionsByAccount(address, chain, collectionLimit)]);

    const result = {
      address,
      chain,
      nfts: nftsResponse.status === "fulfilled" ? nftsResponse.value : null,
      collections: collectionsResponse.status === "fulfilled" ? collectionsResponse.value : null,
      errors: [],
    };

    // Collect any errors
    if (nftsResponse.status === "rejected") {
      result.errors.push(`NFTs fetch failed: ${nftsResponse.reason.message}`);
    }
    if (collectionsResponse.status === "rejected") {
      result.errors.push(`Collections fetch failed: ${collectionsResponse.reason.message}`);
    }

    return result;
  } catch (error) {
    console.error("Error fetching comprehensive account NFT data:", error);
    throw new Error(error.message || "Failed to fetch account NFT data");
  }
};

// ===== ADDRESS INFO =====

export const getAddressInfo = async (address) => {
  try {
    if (!address) {
      throw new Error("Address is required");
    }

    const response = await api.get(`/address/${address}/info`);
    return response.data;
  } catch (error) {
    console.error("Error fetching address info:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch address information");
  }
};


export default api;
