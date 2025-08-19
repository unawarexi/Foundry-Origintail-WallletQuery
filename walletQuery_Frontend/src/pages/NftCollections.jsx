import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, RefreshCw, Loader2, AlertCircle, ExternalLink, Copy, CheckCircle, Image as ImageIcon, Palette, TrendingUp, TrendingDown, Eye, Heart, Star, Grid3X3, List, Calendar, DollarSign, Activity, ChevronDown, ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { useBlockchain } from "../core/hooks/useContext";
import useResponsive from "../core/hooks/useResponsive";
import { formatAddress, formatAge, formatValue } from "../core/utils/Formatters.js";

const NftCollections = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { nftTransactions, erc1155Transactions, currentWallet, loading, error, loadingStep, fetchNFTTransactions, fetchERC1155Transactions, fetchComprehensiveWalletData, validateWalletAddress, clearError, clearData } = useBlockchain();

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

  // Filter states
  const [filters, setFilters] = useState({
    type: "all", // all, erc721, erc1155
    sortBy: "recent", // recent, name, value, count
    minValue: "",
    maxValue: "",
    dateRange: "all",
  });

  // Process NFT data into collections
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
            imageUrl: null, // We'll use a placeholder or try to get from metadata
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
      setFilteredCollections(collectionsArray);
    }
  }, [nftTransactions, erc1155Transactions, currentWallet]);

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...collections];

    // Search functionality
    if (searchTerm) {
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
  }, [collections, searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCollections = filteredCollections.slice(startIndex, endIndex);

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

    clearData();
    setCollections([]);
    setFilteredCollections([]);
    setCurrentPage(1);

    try {
      // Fetch both NFT types
      await Promise.all([fetchNFTTransactions(validation.checksumAddress || walletAddress.trim()), fetchERC1155Transactions(validation.checksumAddress || walletAddress.trim())]);
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

  const getGridClass = () => {
    if (isMobile) return "grid-cols-1";
    if (isTablet) return "grid-cols-2";
    return "grid-cols-4";
  };

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

            <button onClick={validateAndFetchData} disabled={loading} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? (
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

        {/* Collections Summary */}
        {collections.length > 0 && (
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
      </div>

      {/* Controls Section */}
      {collections.length > 0 && (
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-slate-400">
                Showing {Math.min(itemsPerPage, filteredCollections.length)} of <span className="text-purple-400 font-semibold">{filteredCollections.length}</span> collections
              </p>

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
              <button onClick={refreshData} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 transition-colors disabled:opacity-50">
                <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
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
                placeholder="Search collections by name, symbol, or address..."
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
                    <option value="count">NFT Count</option>
                    <option value="value">Total Value</option>
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
      {loading && (
        <div className="p-8 text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-purple-400" size={48} />
          <p className="text-slate-400">{loadingStep || "Loading NFT collections..."}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6">
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div>
              <p className="text-red-400 font-medium">Error loading NFT collections</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && collections.length === 0 && (
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

      {/* Collections Grid/List */}
      {!loading && !error && collections.length > 0 && (
        <>
          <div className="p-6">
            {viewMode === "grid" ? (
              <div className={`grid ${getGridClass()} gap-6`}>
                {currentCollections.map((collection, index) => (
                  <motion.div key={collection.contractAddress} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-purple-500 transition-all duration-300 group">
                    {/* Collection Image Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 group-hover:from-purple-600/20 group-hover:to-blue-600/20 transition-all duration-300" />
                      <ImageIcon className="text-slate-400 group-hover:text-purple-400 transition-colors" size={48} />
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
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="text-slate-400" size={24} />
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

          {/* Pagination */}
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
    </div>
  );
};

export default NftCollections;
