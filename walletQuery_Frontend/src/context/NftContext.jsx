import React, { createContext, useContext, useState } from "react";
import { checkNFTAPIHealth, getAllCollections, getCollectionsByAccount, getNFTsByCollection, getNFTsByAccount, getAccountNFTData, getAddressInfo } from "../apis/nft.api.js";
import { calculateNFTSummary, formatCollectionData, formatNFTData, isValidAddress } from "../core/utils/HelperFunctions.js";

// Create context
const NFTContext = createContext();

// Provider component
const NFTProvider = ({ children }) => {
  // ===== STATE MANAGEMENT =====
  const [nfts, setNfts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [accountCollections, setAccountCollections] = useState([]);
  const [collectionNFTs, setCollectionNFTs] = useState([]);
  const [addressInfo, setAddressInfo] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentCollection, setCurrentCollection] = useState("");
  const [nftSummary, setNftSummary] = useState({
    totalNFTs: 0,
    totalCollections: 0,
    totalEstimatedValue: 0,
    topCollections: [],
    recentActivity: [],
    tokenStandards: {},
    chains: {},
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");

  // Pagination states
  const [collectionsNextCursor, setCollectionsNextCursor] = useState(null);
  const [nftsNextCursor, setNftsNextCursor] = useState(null);
  const [collectionNFTsNextCursor, setCollectionNFTsNextCursor] = useState(null);

  // API health status
  const [apiHealth, setApiHealth] = useState(null);

  // ===== UTILITY FUNCTIONS =====

  const validateAddress = (address) => {
    if (!isValidAddress(address)) {
      throw new Error("Invalid Ethereum address format");
    }
    return address.toLowerCase();
  };

  const handleError = (error, defaultMessage) => {
    const errorMessage = error.response?.data?.error || error.message || defaultMessage;
    setError(errorMessage);
    console.error(defaultMessage, error);
    throw new Error(errorMessage);
  };

  // ===== API HEALTH CHECK =====

  const fetchAPIHealth = async () => {
    setLoadingStep("Checking NFT API health...");
    try {
      const health = await checkNFTAPIHealth();
      setApiHealth(health);
      return health;
    } catch (err) {
      handleError(err, "Failed to check NFT API health");
    }
  };

  // ===== COLLECTIONS API =====

  const fetchAllCollections = async (limit = 50, next = null, append = false) => {
    if (!append) {
      setLoading(true);
      setLoadingStep("Fetching popular collections...");
    } else {
      setLoadingStep("Loading more collections...");
    }
    setError(null);

    try {
      const data = await getAllCollections(limit, next);

      if (data.success) {
        const formattedCollections = data.data.collections?.map(formatCollectionData) || [];

        if (append) {
          setCollections((prev) => [...prev, ...formattedCollections]);
        } else {
          setCollections(formattedCollections);
        }

        setCollectionsNextCursor(data.pagination?.next || null);
        return data;
      } else {
        throw new Error(data.error || "Failed to fetch collections");
      }
    } catch (err) {
      handleError(err, "Failed to fetch collections");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const fetchAccountCollections = async (address, chain = "ethereum", limit = 200) => {
    setLoading(true);
    setLoadingStep("Fetching account collections...");
    setError(null);

    try {
      const validAddress = validateAddress(address);
      const data = await getCollectionsByAccount(validAddress, chain, limit);

      if (data.success) {
        const formattedCollections = data.data.collections?.map(formatCollectionData) || [];
        setAccountCollections(formattedCollections);
        setCurrentAccount(validAddress);

        return {
          collections: formattedCollections,
          totalCollections: data.data.total_collections || 0,
          totalNFTs: data.data.total_nfts || 0,
        };
      } else {
        throw new Error(data.error || "Failed to fetch account collections");
      }
    } catch (err) {
      handleError(err, "Failed to fetch account collections");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const fetchCollectionNFTs = async (collectionSlug, limit = 50, next = null, append = false) => {
    if (!append) {
      setLoading(true);
      setLoadingStep(`Fetching NFTs from ${collectionSlug}...`);
    } else {
      setLoadingStep("Loading more NFTs...");
    }
    setError(null);

    try {
      const data = await getNFTsByCollection(collectionSlug, limit, next);

      if (data.success) {
        const formattedNFTs = data.data.nfts?.map(formatNFTData) || [];

        if (append) {
          setCollectionNFTs((prev) => [...prev, ...formattedNFTs]);
        } else {
          setCollectionNFTs(formattedNFTs);
          setCurrentCollection(collectionSlug);
        }

        setCollectionNFTsNextCursor(data.pagination?.next || null);
        return data;
      } else {
        throw new Error(data.error || "Failed to fetch collection NFTs");
      }
    } catch (err) {
      handleError(err, "Failed to fetch collection NFTs");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ===== ACCOUNT NFTs API =====

  const fetchAccountNFTs = async (address, chain = "ethereum", limit = 50, next = null, append = false) => {
    if (!append) {
      setLoading(true);
      setLoadingStep("Fetching account NFTs...");
    } else {
      setLoadingStep("Loading more NFTs...");
    }
    setError(null);

    try {
      const validAddress = validateAddress(address);
      const data = await getNFTsByAccount(validAddress, chain, limit, next);

      if (data.success) {
        const formattedNFTs = data.data.nfts?.map(formatNFTData) || [];

        if (append) {
          setNfts((prev) => [...prev, ...formattedNFTs]);
        } else {
          setNfts(formattedNFTs);
          setCurrentAccount(validAddress);
        }

        setNftsNextCursor(data.pagination?.next || null);
        return data;
      } else {
        throw new Error(data.error || "Failed to fetch account NFTs");
      }
    } catch (err) {
      handleError(err, "Failed to fetch account NFTs");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const fetchComprehensiveAccountData = async (address, chain = "ethereum", nftLimit = 100, collectionLimit = 200) => {
    setLoading(true);
    setError(null);
    setLoadingStep("Analyzing NFT portfolio...");

    try {
      const validAddress = validateAddress(address);

      // Step 1: Get address info
      setLoadingStep("Fetching address information...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      let addressInfoData = null;
      try {
        const addressResponse = await getAddressInfo(validAddress);
        if (addressResponse.success) {
          addressInfoData = addressResponse.data;
          setAddressInfo(addressInfoData);
        }
      } catch (err) {
        console.warn("Failed to fetch address info:", err.message);
      }

      // Step 2: Get comprehensive NFT data
      setLoadingStep("Fetching NFT collections and assets...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      const nftData = await getAccountNFTData(validAddress, chain, nftLimit, collectionLimit);

      // Process NFTs
      if (nftData.nfts?.success && nftData.nfts.data?.nfts) {
        const formattedNFTs = nftData.nfts.data.nfts.map(formatNFTData);
        setNfts(formattedNFTs);
        setNftsNextCursor(nftData.nfts.pagination?.next || null);
      } else {
        setNfts([]);
      }

      // Process Collections
      if (nftData.collections?.success && nftData.collections.data?.collections) {
        const formattedCollections = nftData.collections.data.collections.map(formatCollectionData);
        setAccountCollections(formattedCollections);
      } else {
        setAccountCollections([]);
      }

      // Step 3: Calculate portfolio summary
      setLoadingStep("Calculating portfolio summary...");
      await new Promise((resolve) => setTimeout(resolve, 300));

      const summary = calculateNFTSummary(nftData.nfts?.data?.nfts || [], nftData.collections?.data?.collections || []);
      setNftSummary(summary);
      setCurrentAccount(validAddress);

      setLoadingStep("Portfolio analysis complete!");
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        address: validAddress,
        addressInfo: addressInfoData,
        nfts: nftData.nfts?.data?.nfts || [],
        collections: nftData.collections?.data?.collections || [],
        summary,
        errors: nftData.errors || [],
      };
    } catch (err) {
      handleError(err, "Failed to fetch comprehensive account data");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ===== ADDRESS INFO API =====

  const fetchAddressInfo = async (address) => {
    setLoading(true);
    setLoadingStep("Fetching address information...");
    setError(null);

    try {
      const validAddress = validateAddress(address);
      const data = await getAddressInfo(validAddress);

      if (data.success) {
        setAddressInfo(data.data);
        return data.data;
      } else {
        throw new Error(data.error || "Failed to fetch address information");
      }
    } catch (err) {
      handleError(err, "Failed to fetch address information");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ===== PAGINATION HELPERS =====

  const loadMoreCollections = async (limit = 50) => {
    if (!collectionsNextCursor) return null;
    return await fetchAllCollections(limit, collectionsNextCursor, true);
  };

  const loadMoreAccountNFTs = async (limit = 50) => {
    if (!nftsNextCursor || !currentAccount) return null;
    return await fetchAccountNFTs(currentAccount, "ethereum", limit, nftsNextCursor, true);
  };

  const loadMoreCollectionNFTs = async (limit = 50) => {
    if (!collectionNFTsNextCursor || !currentCollection) return null;
    return await fetchCollectionNFTs(currentCollection, limit, collectionNFTsNextCursor, true);
  };

  // ===== SEARCH AND FILTER =====

  const searchCollections = (query) => {
    if (!query) return collections;

    const lowercaseQuery = query.toLowerCase();
    return collections.filter((collection) => collection.name?.toLowerCase().includes(lowercaseQuery) || collection.slug?.toLowerCase().includes(lowercaseQuery) || collection.description?.toLowerCase().includes(lowercaseQuery));
  };

  const searchNFTs = (query) => {
    if (!query) return nfts;

    const lowercaseQuery = query.toLowerCase();
    return nfts.filter((nft) => nft.name?.toLowerCase().includes(lowercaseQuery) || nft.description?.toLowerCase().includes(lowercaseQuery) || nft.collection?.toLowerCase().includes(lowercaseQuery));
  };

  const filterNFTsByCollection = (collectionSlug) => {
    if (!collectionSlug) return nfts;
    return nfts.filter((nft) => nft.collection === collectionSlug);
  };

  const filterNFTsByTokenStandard = (standard) => {
    if (!standard) return nfts;
    return nfts.filter((nft) => nft.tokenStandard === standard);
  };

  // ===== CONTROL FUNCTIONS =====

  const clearError = () => setError(null);

  const clearData = () => {
    setNfts([]);
    setCollections([]);
    setAccountCollections([]);
    setCollectionNFTs([]);
    setAddressInfo(null);
    setCurrentAccount("");
    setCurrentCollection("");
    setNftSummary({
      totalNFTs: 0,
      totalCollections: 0,
      totalEstimatedValue: 0,
      topCollections: [],
      recentActivity: [],
      tokenStandards: {},
      chains: {},
    });
    setCollectionsNextCursor(null);
    setNftsNextCursor(null);
    setCollectionNFTsNextCursor(null);
    setLoadingStep("");
    setApiHealth(null);
  };

  const refreshAccountData = async () => {
    if (currentAccount) {
      await fetchComprehensiveAccountData(currentAccount);
    }
  };

  const refreshCollectionData = async () => {
    if (currentCollection) {
      await fetchCollectionNFTs(currentCollection);
    }
  };

  // ===== CONTEXT VALUE =====

  const contextValue = {
    // ===== STATE =====
    nfts,
    collections,
    accountCollections,
    collectionNFTs,
    addressInfo,
    currentAccount,
    currentCollection,
    nftSummary,
    loading,
    error,
    loadingStep,
    apiHealth,

    // Pagination cursors
    collectionsNextCursor,
    nftsNextCursor,
    collectionNFTsNextCursor,

    // ===== API FUNCTIONS =====
    fetchAPIHealth,
    fetchAllCollections,
    fetchAccountCollections,
    fetchCollectionNFTs,
    fetchAccountNFTs,
    fetchComprehensiveAccountData,
    fetchAddressInfo,

    // ===== PAGINATION =====
    loadMoreCollections,
    loadMoreAccountNFTs,
    loadMoreCollectionNFTs,

    // ===== SEARCH AND FILTER =====
    searchCollections,
    searchNFTs,
    filterNFTsByCollection,
    filterNFTsByTokenStandard,

    // ===== UTILITY FUNCTIONS =====
    isValidAddress,
    formatNFTData,
    formatCollectionData,
    calculateNFTSummary,

    // ===== CONTROL FUNCTIONS =====
    clearError,
    clearData,
    refreshAccountData,
    refreshCollectionData,
  };

  return <NFTContext.Provider value={contextValue}>{children}</NFTContext.Provider>;
};

// Hook for consuming context

export { NFTProvider, NFTContext };
