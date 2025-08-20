import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  ExternalLink,
  Copy,
  CheckCircle,
  Image as ImageIcon,
  Palette,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Star,
  Grid3X3,
  List,
  Calendar,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import { useBlockchain, useNFT } from "../core/hooks/useContext";
import useResponsive from "../core/hooks/useResponsive";
import { formatAddress, formatAge, formatValue } from "../core/utils/Formatters.js";

const NftCollections = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const {
    nftTransactions,
    erc1155Transactions,
    currentWallet,
    loading: blockchainLoading,
    error: blockchainError,
    loadingStep: blockchainLoadingStep,
    fetchNFTTransactions,
    fetchERC1155Transactions,
    fetchComprehensiveWalletData,
    validateWalletAddress,
    clearError: clearBlockchainError,
    clearData: clearBlockchainData,
  } = useBlockchain();

  // NFT Context for collections data
  const {
    collections: nftCollections,
    accountCollections,
    collectionNFTs,
    currentAccount,
    currentCollection,
    loading: nftLoading,
    error: nftError,
    loadingStep: nftLoadingStep,
    fetchAccountCollections,
    fetchCollectionNFTs,
    fetchComprehensiveAccountData,
    searchCollections,
    clearError: clearNftError,
    clearData: clearNftData,
  } = useNFT();

  // State management
  const [walletAddress, setWalletAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8); // 2 rows of 4
  const [activeSection, setActiveSection] = useState("transactions"); // transactions, collections, collection-nfts
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    type: "all", // all, erc721, erc1155
    sortBy: "recent", // recent, name, value, count
    minValue: "",
    maxValue: "",
    dateRange: "all",
  });

  // Collection-specific states
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionItemsPerPage, setCollectionItemsPerPage] = useState(12);
  const [nftPage, setNftPage] = useState(1);
  const [nftItemsPerPage, setNftItemsPerPage] = useState(12);

  // Process NFT data into collections (existing logic)
  useEffect(() => {
    if ((nftTransactions && nftTransactions.length > 0) || (erc1155Transactions && erc1155Transactions.length > 0)) {
      const allNfts = [...(nftTransactions || []), ...(erc1155Transactions || [])];

      // Group by contract address to create collections
      const collectionsMap = new Map();

      allNfts.forEach((nft) => {
        const contractAddress = nft.contractAddress || nft.to;
        if (!contractAddress) return;

        if (!collectionsMap.has(contractAddress)) {
          collectionsMap.set(contractAddress, {
            contractAddress,
            name: nft.tokenName || `Collection ${contractAddress.slice(0, 6)}...`,
            symbol: nft.tokenSymbol || "NFT",
            type: nft.tokenID ? "ERC-721" : "ERC-1155",
            totalItems: 0,
            ownedItems: 0,
            firstSeen: nft.timeStamp,
            lastActivity: nft.timeStamp,
            transactions: [],
            floorPrice: null,
            totalValue: 0,
            imageUrl: null,
            description: null,
            verified: false,
          });
        }

        const collection = collectionsMap.get(contractAddress);
        collection.transactions.push(nft);
        collection.totalItems++;

        // Update timestamps
        if (nft.timeStamp > collection.lastActivity) {
          collection.lastActivity = nft.timeStamp;
        }
        if (nft.timeStamp < collection.firstSeen) {
          collection.firstSeen = nft.timeStamp;
        }

        // Calculate owned items (simplified logic)
        if (nft.to?.toLowerCase() === currentWallet?.toLowerCase()) {
          collection.ownedItems++;
        } else if (nft.from?.toLowerCase() === currentWallet?.toLowerCase()) {
          collection.ownedItems = Math.max(0, collection.ownedItems - 1);
        }
      });

      const collectionsArray = Array.from(collectionsMap.values());
      setCollections(collectionsArray);
    }
  }, [nftTransactions, erc1155Transactions, currentWallet]);

  // Handle search and filtering for transaction-based collections
  useEffect(() => {
    let filtered = [...collections];

    // Search functionality
    if (searchTerm && activeSection === "transactions") {
      filtered = filtered.filter((collection) => collection.name.toLowerCase().includes(searchTerm.toLowerCase()) || collection.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || collection.contractAddress.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Apply filters
    if (filters.type !== "all") {
      filtered = filtered.filter((collection) => collection.type.toLowerCase() === filters.type.toLowerCase());
    }

    // Sort collections
    switch (filters.sortBy) {
      case "recent":
        filtered.sort((a, b) => b.lastActivity - a.lastActivity);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "count":
        filtered.sort((a, b) => b.ownedItems - a.ownedItems);
        break;
      case "value":
        filtered.sort((a, b) => b.totalValue - a.totalValue);
        break;
    }

    setFilteredCollections(filtered);
    setCurrentPage(1);
  }, [collections, searchTerm, filters, activeSection]);

  // Filter NFT Context collections based on search and filters
  const filteredNftCollections = useMemo(() => {
    if (activeSection !== "collections") return [];

    let filtered = searchTerm ? searchCollections(searchTerm) : accountCollections || [];

    // Apply type filter
    if (filters.type !== "all") {
      const typeMapping = {
        "erc-721": "ERC721",
        "erc-1155": "ERC1155",
      };
      const mappedType = typeMapping[filters.type] || filters.type.toUpperCase();
      filtered = filtered.filter((collection) => collection.token_standard?.toUpperCase() === mappedType);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
        break;
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "count":
        filtered.sort((a, b) => (b.total_supply || 0) - (a.total_supply || 0));
        break;
      case "value":
        filtered.sort((a, b) => (b.floor_price || 0) - (a.floor_price || 0));
        break;
    }

    return filtered;
  }, [accountCollections, searchTerm, filters, activeSection, searchCollections]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCollections = filteredCollections.slice(startIndex, endIndex);

  // Collection pagination
  const collectionTotalPages = Math.ceil(filteredNftCollections.length / collectionItemsPerPage);
  const collectionStartIndex = (collectionPage - 1) * collectionItemsPerPage;
  const collectionEndIndex = collectionStartIndex + collectionItemsPerPage;
  const currentNftCollections = filteredNftCollections.slice(collectionStartIndex, collectionEndIndex);

  // NFT pagination
  const nftTotalPages = Math.ceil((collectionNFTs?.length || 0) / nftItemsPerPage);
  const nftStartIndex = (nftPage - 1) * nftItemsPerPage;
  const nftEndIndex = nftStartIndex + nftItemsPerPage;
  const currentNFTs = (collectionNFTs || []).slice(nftStartIndex, nftEndIndex);

  // Address validation and fetching
  const validateAndFetchData = async () => {
    if (!walletAddress.trim()) {
      setAddressError("Please enter a wallet address");
      return;
    }

    setAddressError("");

    const validation = await validateWalletAddress(walletAddress.trim());
    if (!validation.isValid) {
      setAddressError("Invalid Ethereum address format");
      return;
    }

    const validAddress = validation.checksumAddress || walletAddress.trim();

    // Clear existing data
    clearBlockchainData();
    clearNftData();
    setCollections([]);
    setFilteredCollections([]);
    setCurrentPage(1);
    setCollectionPage(1);
    setNftPage(1);
    setSelectedCollection(null);
    setActiveSection("transactions");

    try {
      // Fetch transaction-based NFT data first
      await Promise.all([fetchNFTTransactions(validAddress), fetchERC1155Transactions(validAddress)]);

      // Then fetch NFT Context collections data
      await fetchAccountCollections(validAddress);
    } catch (err) {
      console.error("Error fetching NFT data:", err);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const refreshData = async () => {
    if (walletAddress.trim()) {
      await validateAndFetchData();
    }
  };

  const handleCollectionClick = async (collection) => {
    setSelectedCollection(collection);
    setActiveSection("collection-nfts");
    setNftPage(1);

    try {
      await fetchCollectionNFTs(collection.slug || collection.contractAddress);
    } catch (err) {
      console.error("Error fetching collection NFTs:", err);
    }
  };

  const handleBackToCollections = () => {
    setActiveSection("collections");
    setSelectedCollection(null);
  };

  const handleBackToTransactions = () => {
    setActiveSection("transactions");
    setSelectedCollection(null);
  };

  function resolveIPFS(url) {
    if (!url) return null;
    if (url.startsWith("ipfs://")) {
      return url.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return url;
  }

  const getGridClass = () => {
    if (isMobile) return "grid-cols-1";
    if (isTablet) return "grid-cols-2";
    return "grid-cols-4";
  };

  const isLoading = blockchainLoading || nftLoading;
  const currentError = blockchainError || nftError;
  const currentLoadingStep = blockchainLoadingStep || nftLoadingStep;

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-xl py-10 border border-slate-700 shadow-2xl">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">NFT Collections</h2>
          <p className="text-slate-400">Explore and manage your NFT collections across ERC-721 and ERC-1155 standards</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter Ethereum address (0x...)"
                  value={walletAddress}
                  onChange={(e) => {
                    setWalletAddress(e.target.value);
                    if (addressError) setAddressError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && validateAndFetchData()}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 ${addressError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-600 focus:border-blue-500 focus:ring-blue-500"}`}
                />
              </div>
              {addressError && (
                <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {addressError}
                </p>
              )}
            </div>

            <button onClick={validateAndFetchData} disabled={isLoading} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Loading...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Explore NFTs
                </>
              )}
            </button>
          </div>

          {/* Quick address examples */}
          <div className="flex flex-wrap gap-2">
            <span className="text-slate-400 text-sm">Try:</span>
            {[
              { label: "Vitalik.eth", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
              { label: "OpenSea", address: "0x7f268357A8c2552623316e2562D90e642bB538E5" },
            ].map((example) => (
              <button key={example.address} onClick={() => setWalletAddress(example.address)} className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded transition-colors">
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Navigation */}
        {(collections.length > 0 || accountCollections.length > 0) && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => setActiveSection("transactions")} className={`px-4 py-2 rounded-lg transition-all ${activeSection === "transactions" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"}`}>
              Transaction-Based Collections ({collections.length})
            </button>
            <button onClick={() => setActiveSection("collections")} className={`px-4 py-2 rounded-lg transition-all ${activeSection === "collections" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"}`}>
              All Collections ({accountCollections.length})
            </button>
          </div>
        )}

        {/* Collections Summary */}
        {activeSection === "transactions" && collections.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Collections</p>
                  <p className="text-2xl font-bold text-white">{filteredCollections.length}</p>
                </div>
                <Palette className="text-purple-400" size={24} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total NFTs</p>
                  <p className="text-2xl font-bold text-white">{collections.reduce((sum, col) => sum + col.ownedItems, 0)}</p>
                </div>
                <ImageIcon className="text-green-400" size={24} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">ERC-721</p>
                  <p className="text-2xl font-bold text-white">{collections.filter((c) => c.type === "ERC-721").length}</p>
                </div>
                <Star className="text-yellow-400" size={24} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">ERC-1155</p>
                  <p className="text-2xl font-bold text-white">{collections.filter((c) => c.type === "ERC-1155").length}</p>
                </div>
                <Activity className="text-orange-400" size={24} />
              </div>
            </div>
          </div>
        )}

        {/* NFT Collections Summary */}
        {activeSection === "collections" && accountCollections.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Collections</p>
                  <p className="text-2xl font-bold text-white">{filteredNftCollections.length}</p>
                </div>
                <Palette className="text-purple-400" size={24} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Verified Collections</p>
                  <p className="text-2xl font-bold text-white">{accountCollections.filter((c) => c.safelistRequestStatus === "verified").length}</p>
                </div>
                <CheckCircle className="text-green-400" size={24} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Average Floor Price</p>
                  <p className="text-2xl font-bold text-white">{formatValue(accountCollections.reduce((sum, c) => sum + (c.floor_price || 0), 0) / Math.max(accountCollections.filter((c) => c.floor_price).length, 1))}</p>
                </div>
                <TrendingUp className="text-blue-400" size={24} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Supply</p>
                  <p className="text-2xl font-bold text-white">{accountCollections.reduce((sum, c) => sum + (c.total_supply || 0), 0)}</p>
                </div>
                <Activity className="text-orange-400" size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Section */}
      {((activeSection === "transactions" && collections.length > 0) || (activeSection === "collections" && accountCollections.length > 0) || (activeSection === "collection-nfts" && selectedCollection)) && (
        <div className="p-6 border-b border-slate-700">
          {/* Back button for collection NFTs view */}
          {activeSection === "collection-nfts" && selectedCollection && (
            <div className="mb-4">
              <button onClick={handleBackToCollections} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                <ArrowLeft size={16} />
                Back to Collections
              </button>
              <h3 className="text-xl font-bold text-white mt-2">NFTs from {selectedCollection.name || selectedCollection.contractAddress}</h3>
              <p className="text-slate-400 text-sm">{collectionNFTs?.length || 0} NFTs found</p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {activeSection === "transactions" && (
                <p className="text-slate-400">
                  Showing {Math.min(itemsPerPage, filteredCollections.length)} of <span className="text-purple-400 font-semibold">{filteredCollections.length}</span> collections
                </p>
              )}
              {activeSection === "collections" && (
                <p className="text-slate-400">
                  Showing {Math.min(collectionItemsPerPage, filteredNftCollections.length)} of <span className="text-purple-400 font-semibold">{filteredNftCollections.length}</span> collections
                </p>
              )}
              {activeSection === "collection-nfts" && (
                <p className="text-slate-400">
                  Showing {Math.min(nftItemsPerPage, collectionNFTs?.length || 0)} of <span className="text-purple-400 font-semibold">{collectionNFTs?.length || 0}</span> NFTs
                </p>
              )}

              <div className="flex items-center gap-2 bg-slate-800 rounded-lg border border-slate-600">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-l-lg transition-colors ${viewMode === "grid" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  <Grid3X3 size={16} />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-r-lg transition-colors ${viewMode === "list" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  <List size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={refreshData} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors disabled:opacity-50">
                <RefreshCw className={isLoading ? "animate-spin" : ""} size={16} />
                Refresh
              </button>

              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder={activeSection === "collection-nfts" ? "Search NFTs by name or description..." : "Search collections by name, symbol, or address..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-slate-700 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Token Type</label>
                  <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="all">All Types</option>
                    <option value="erc-721">ERC-721</option>
                    <option value="erc-1155">ERC-1155</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                  <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="recent">Most Recent</option>
                    <option value="name">Name</option>
                    <option value="count">{activeSection === "collections" ? "Total Supply" : "NFT Count"}</option>
                    <option value="value">{activeSection === "collections" ? "Floor Price" : "Total Value"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Min Items</label>
                  <input type="number" placeholder="0" value={filters.minValue} onChange={(e) => setFilters({ ...filters, minValue: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Max Items</label>
                  <input type="number" placeholder="∞" value={filters.maxValue} onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setFilters({
                      type: "all",
                      sortBy: "recent",
                      minValue: "",
                      maxValue: "",
                      dateRange: "all",
                    })
                  }
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="p-8 text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-purple-400" size={48} />
          <p className="text-slate-400">{currentLoadingStep || "Loading NFT collections..."}</p>
        </div>
      )}

      {/* Error State */}
      {currentError && (
        <div className="p-6">
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div>
              <p className="text-red-400 font-medium">Error loading NFT collections</p>
              <p className="text-red-300 text-sm">{currentError}</p>
            </div>
            <button
              onClick={() => {
                clearBlockchainError();
                clearNftError();
              }}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !currentError && collections.length === 0 && accountCollections.length === 0 && (
        <div className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No NFT Collections Found</h3>
            <p className="text-slate-400 mb-6">Enter an Ethereum address above to explore NFT collections and view detailed analytics.</p>
            <div className="text-sm text-slate-500">
              <p>• View ERC-721 and ERC-1155 collections</p>
              <p>• Track ownership and transaction history</p>
              <p>• Analyze collection performance</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction-Based Collections Grid/List */}
      {!isLoading && !currentError && activeSection === "transactions" && collections.length > 0 && (
        <>
          <div className="p-6">
            {viewMode === "grid" ? (
              <div className={`grid ${getGridClass()} gap-6`}>
                {currentCollections.map((collection, index) => (
                  <motion.div key={collection.contractAddress} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition-all duration-300 group">
                    {/* Collection Image */}
                    <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center relative overflow-hidden">
                      {collection.imageUrl ? (
                        <img
                          src={resolveIPFS(collection.imageUrl)}
                          alt={collection.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 group-hover:from-purple-600/20 group-hover:to-blue-600/20 transition-all duration-300 flex items-center justify-center ${collection.imageUrl ? "hidden" : "flex"}`}>
                        <ImageIcon className="text-slate-400 group-hover:text-purple-400 transition-colors" size={48} />
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${collection.type === "ERC-721" ? "bg-yellow-600 text-yellow-100" : "bg-orange-600 text-orange-100"}`}>{collection.type}</span>
                      </div>
                    </div>

                    {/* Collection Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">{collection.name}</h3>
                          <p className="text-slate-400 text-sm">{collection.symbol}</p>
                        </div>
                        {collection.verified && <CheckCircle className="text-green-400 flex-shrink-0 ml-2" size={16} />}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Owned Items:</span>
                          <span className="text-white font-medium">{collection.ownedItems}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Total Transactions:</span>
                          <span className="text-white font-medium">{collection.transactions.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Last Activity:</span>
                          <span className="text-white font-medium">{formatAge(collection.lastActivity)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <button onClick={() => copyToClipboard(collection.contractAddress)} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                          {formatAddress(collection.contractAddress)}
                          {copiedAddress === collection.contractAddress ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                        <button className="text-slate-400 hover:text-purple-400 transition-colors">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {currentCollections.map((collection, index) => (
                  <motion.div key={collection.contractAddress} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-purple-500 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        {collection.imageUrl ? (
                          <img
                            src={collection.imageUrl}
                            alt={collection.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center ${collection.imageUrl ? "hidden" : "flex"}`}>
                          <ImageIcon className="text-slate-400" size={24} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold truncate">{collection.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${collection.type === "ERC-721" ? "bg-yellow-600 text-yellow-100" : "bg-orange-600 text-orange-100"}`}>{collection.type}</span>
                          {collection.verified && <CheckCircle className="text-green-400" size={16} />}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{collection.symbol}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Owned: </span>
                            <span className="text-white font-medium">{collection.ownedItems}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Transactions: </span>
                            <span className="text-white font-medium">{collection.transactions.length}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Last Activity: </span>
                            <span className="text-white font-medium">{formatAge(collection.lastActivity)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => copyToClipboard(collection.contractAddress)} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                              {formatAddress(collection.contractAddress)}
                              {copiedAddress === collection.contractAddress ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                            </button>
                            <button className="text-slate-400 hover:text-purple-400 transition-colors">
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination for Transaction Collections */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCollections.length)} of {filteredCollections.length} collections
                </span>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={8}>8 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={16}>16 per page</option>
                  <option value={20}>20 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="px-4 py-2 text-slate-300">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* NFT Context Collections Grid/List */}
      {!isLoading && !currentError && activeSection === "collections" && accountCollections.length > 0 && (
        <>
          <div className="p-6">
            {viewMode === "grid" ? (
              <div className={`grid ${getGridClass()} gap-6`}>
                {currentNftCollections.map((collection, index) => (
                  <motion.div
                    key={collection.collection || collection.slug || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition-all duration-300 group cursor-pointer"
                    onClick={() => handleCollectionClick(collection)}
                  >
                    
                    {/* Collection Image */}
                    <div
                      className="aspect-square bg-gradient-to-br from-purple-600/20 to-blue-600/20 
                flex items-center justify-center relative overflow-hidden p-2 rounded-lg"
                    >
                      {collection.image_url ? (
                        <img
                          src={collection.image_url}
                          alt={collection.name}
                          referrerPolicy="no-referrer"
                          className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-cover rounded-lg 
                 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}

                      {/* Fallback Icon */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 
                group-hover:from-purple-600/20 group-hover:to-blue-600/20 
                transition-all duration-300 flex items-center justify-center 
                ${collection.image_url ? "hidden" : "flex"}`}
                      >
                        <ImageIcon
                          className="text-slate-400 group-hover:text-purple-400 transition-colors"
                          size={32} // smaller than before
                        />
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${collection.token_standard === "ERC721" ? "bg-yellow-600 text-yellow-100" : "bg-orange-600 text-orange-100"}`}>{collection.token_standard || "NFT"}</span>
                      </div>
                      {collection.safelistRequestStatus === "verified" && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle className="text-green-400" size={16} />
                        </div>
                      )}
                    </div>

                    {/* Collection Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">{collection.name || "Unnamed Collection"}</h3>
                          <p className="text-slate-400 text-sm">{collection.symbol || "NFT"}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Total Supply:</span>
                          <span className="text-white font-medium">{collection.total_supply || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Floor Price:</span>
                          <span className="text-white font-medium">{collection.floor_price ? formatValue(collection.floor_price) : "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Created:</span>
                          <span className="text-white font-medium">{collection.created_date ? formatAge(new Date(collection.created_date).getTime() / 1000) : "N/A"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(collection.primary_asset_contracts?.[0]?.address || collection.slug || "");
                          }}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          {formatAddress(collection.primary_asset_contracts?.[0]?.address || collection.slug || "")}
                          {copiedAddress === (collection.primary_asset_contracts?.[0]?.address || collection.slug) ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className="text-slate-400 hover:text-purple-400 transition-colors">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List View for NFT Collections */
              <div className="space-y-3">
                {currentNftCollections.map((collection, index) => (
                  <motion.div
                    key={collection.collection || collection.slug || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-purple-500 transition-all duration-300 cursor-pointer"
                    onClick={() => handleCollectionClick(collection)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        {collection.image_url ? (
                          <img
                            src={collection.image_url || collection.display_image_url}
                            alt={collection.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center ${collection.image_url || collection.display_image_url ? "hidden" : "flex"}`}>
                          <ImageIcon className="text-slate-400" size={24} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold truncate">{collection.name || "Unnamed Collection"}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${collection.token_standard === "erc721" ? "bg-yellow-600 text-yellow-100" : "bg-orange-600 text-orange-100"}`}>{collection.token_standard || "NFT"}</span>
                          {collection.safelistRequestStatus === "verified" && <CheckCircle className="text-green-400" size={16} />}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{collection.symbol || "NFT"}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Supply: </span>
                            <span className="text-white font-medium">{collection.total_supply || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Floor: </span>
                            <span className="text-white font-medium">{collection.floor_price ? formatValue(collection.floor_price) : "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Created: </span>
                            <span className="text-white font-medium">{collection.created_date ? formatAge(new Date(collection.created_date).getTime() / 1000) : "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(collection.primary_asset_contracts?.[0]?.address || collection.slug || "");
                              }}
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {formatAddress(collection.primary_asset_contracts?.[0]?.address || collection.slug || "")}
                              {copiedAddress === (collection.primary_asset_contracts?.[0]?.address || collection.slug) ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                            </button>
                            <button onClick={(e) => e.stopPropagation()} className="text-slate-400 hover:text-purple-400 transition-colors">
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination for NFT Collections */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">
                  Showing {collectionStartIndex + 1} to {Math.min(collectionEndIndex, filteredNftCollections.length)} of {filteredNftCollections.length} collections
                </span>

                <select
                  value={collectionItemsPerPage}
                  onChange={(e) => {
                    setCollectionItemsPerPage(Number(e.target.value));
                    setCollectionPage(1);
                  }}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={8}>8 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={16}>16 per page</option>
                  <option value={20}>20 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCollectionPage(Math.max(1, collectionPage - 1))}
                  disabled={collectionPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="px-4 py-2 text-slate-300">
                  Page {collectionPage} of {collectionTotalPages || 1}
                </span>

                <button
                  onClick={() => setCollectionPage(Math.min(collectionTotalPages, collectionPage + 1))}
                  disabled={collectionPage === collectionTotalPages || collectionTotalPages === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Collection NFTs View */}
      {!isLoading && !currentError && activeSection === "collection-nfts" && selectedCollection && (
        <>
          <div className="p-6">
            {viewMode === "grid" ? (
              <div className={`grid ${getGridClass()} gap-6`}>
                {currentNFTs.map((nft, index) => (
                  <motion.div
                    key={nft.identifier || nft.token_id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition-all duration-300 group"
                  >
                    {/* NFT Image */}
                    <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center relative overflow-hidden">
                      {nft.image_url || nft.image ? (
                        <img
                          src={resolveIPFS(nft.image_url || nft.image)}
                          alt={nft.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 group-hover:from-purple-600/20 group-hover:to-blue-600/20 transition-all duration-300 flex items-center justify-center ${nft.image_url || nft.image ? "hidden" : "flex"}`}>
                        <ImageIcon className="text-slate-400 group-hover:text-purple-400 transition-colors" size={48} />
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-blue-100">#{nft.identifier || nft.token_id || "N/A"}</span>
                      </div>
                    </div>

                    {/* NFT Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">{nft.name || `NFT #${nft.identifier || nft.token_id}`}</h3>
                          <p className="text-slate-400 text-sm">{selectedCollection.name}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Token ID:</span>
                          <span className="text-white font-medium">{nft.identifier || nft.token_id || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Standard:</span>
                          <span className="text-white font-medium">{nft.token_standard || "NFT"}</span>
                        </div>
                        {nft.rarity && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Rarity:</span>
                            <span className="text-white font-medium">{nft.rarity}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <button onClick={() => copyToClipboard(nft.contract || selectedCollection.primary_asset_contracts?.[0]?.address || "")} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                          {formatAddress(nft.contract || selectedCollection.primary_asset_contracts?.[0]?.address || "")}
                          {copiedAddress === (nft.contract || selectedCollection.primary_asset_contracts?.[0]?.address) ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                        <button className="text-slate-400 hover:text-purple-400 transition-colors">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List View for Collection NFTs */
              <div className="space-y-3">
                {currentNFTs.map((nft, index) => (
                  <motion.div key={nft.identifier || nft.token_id || index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="bg-slate-800 rounded-lg border border-slate-700 p-4 hover:border-purple-500 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        {nft.image_url || nft.image ? (
                          <img
                            src={resolveIPFS(nft.image_url || nft.image)}
                            alt={nft.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center ${nft.image_url || nft.image ? "hidden" : "flex"}`}>
                          <ImageIcon className="text-slate-400" size={24} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold truncate">{nft.name || `NFT #${nft.identifier || nft.token_id}`}</h3>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-blue-100">#{nft.identifier || nft.token_id || "N/A"}</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{selectedCollection.name}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Token ID: </span>
                            <span className="text-white font-medium">{nft.identifier || nft.token_id || "N/A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Standard: </span>
                            <span className="text-white font-medium">{nft.token_standard || "NFT"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Rarity: </span>
                            <span className="text-white font-medium">{nft.rarity || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => copyToClipboard(nft.contract || selectedCollection.primary_asset_contracts?.[0]?.address || "")} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                              {formatAddress(nft.contract || selectedCollection.primary_asset_contracts?.[0]?.address || "")}
                              {copiedAddress === (nft.contract || selectedCollection.primary_asset_contracts?.[0]?.address) ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                            </button>
                            <button className="text-slate-400 hover:text-purple-400 transition-colors">
                              <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination for Collection NFTs */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">
                  Showing {nftStartIndex + 1} to {Math.min(nftEndIndex, collectionNFTs?.length || 0)} of {collectionNFTs?.length || 0} NFTs
                </span>

                <select
                  value={nftItemsPerPage}
                  onChange={(e) => {
                    setNftItemsPerPage(Number(e.target.value));
                    setNftPage(1);
                  }}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={8}>8 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={16}>16 per page</option>
                  <option value={20}>20 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setNftPage(Math.max(1, nftPage - 1))} disabled={nftPage === 1} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="px-4 py-2 text-slate-300">
                  Page {nftPage} of {nftTotalPages || 1}
                </span>

                <button
                  onClick={() => setNftPage(Math.min(nftTotalPages, nftPage + 1))}
                  disabled={nftPage === nftTotalPages || nftTotalPages === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty Collection NFTs State */}
      {!isLoading && !currentError && activeSection === "collection-nfts" && selectedCollection && (!collectionNFTs || collectionNFTs.length === 0) && (
        <div className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No NFTs Found</h3>
            <p className="text-slate-400 mb-6">This collection appears to be empty or the NFTs couldn't be loaded.</p>
            <button onClick={handleBackToCollections} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all">
              Back to Collections
            </button>
          </div>
        </div>
      )}

      {/* Empty NFT Collections State */}
      {!isLoading && !currentError && activeSection === "collections" && accountCollections.length === 0 && currentAccount && (
        <div className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Collections Found</h3>
            <p className="text-slate-400 mb-6">This address doesn't appear to own any NFT collections, or they couldn't be loaded from the blockchain.</p>
            <button onClick={() => setActiveSection("transactions")} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all">
              View Transaction-Based Collections
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      {(collections.length > 0 || accountCollections.length > 0) && (
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span>Data sources: Ethereum blockchain transactions & OpenSea API</span>
              <span>•</span>
              <span>Updates in real-time</span>
              {currentAccount && (
                <>
                  <span>•</span>
                  <span>
                    Wallet: <span className="text-purple-400 font-mono">{formatAddress(currentAccount)}</span>
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Activity className="text-green-400" size={16} />
              <span>Live blockchain data</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NftCollections;
