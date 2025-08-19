import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Filter, ChevronDown, ChevronLeft, ChevronRight, Search, Calendar, Coins, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, ExternalLink, Copy, CheckCircle, AlertCircle, Loader2, RefreshCw, Wallet, Activity } from "lucide-react";
import { useBlockchain } from "../core/hooks/useContext";
import useResponsive from "../core/hooks/useResponsive";
import { formatAddress, formatAge, formatValue } from "../core/utils/Formatters.js";

const TransactionsTable = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
    const { allTransactions, loading, error, loadingStep, fetchWalletData, fetchTransactionsByDateRange, fetchTransactionsByToken, fetchTransactionsByType,
        fetchTransactionsByAmountRange, fetchTransactionsAdvanced, validateWalletAddress, exportToCSV, exportToJSON, clearError, clearData } =
    useBlockchain();

  // State management
  const [walletAddress, setWalletAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedHash, setCopiedHash] = useState("");
  const [exporting, setExporting] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    dateRange: "all",
    customStartDate: "",
    customEndDate: "",
    transactionType: "all",
    tokenSymbol: "all",
    minAmount: "",
    maxAmount: "",
    method: "all",
  });

  // Initialize transactions from context
  useEffect(() => {
    if (allTransactions && allTransactions.length > 0) {
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
    }
  }, [allTransactions]);

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...transactions];

    // Search functionality
    if (searchTerm) {
        filtered = filtered.filter((tx) => tx.hash?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.from?.toLowerCase().includes(searchTerm.toLowerCase())
            || tx.to?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.tokenSymbol?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Apply filters
    if (filters.transactionType !== "all") {
      filtered = filtered.filter((tx) => tx.type === filters.transactionType);
    }

    if (filters.tokenSymbol !== "all") {
      filtered = filtered.filter((tx) => tx.tokenSymbol === filters.tokenSymbol);
    }

    if (filters.method !== "all") {
      filtered = filtered.filter((tx) => tx.method === filters.method);
    }

    // Amount range filter
    if (filters.minAmount || filters.maxAmount) {
      filtered = filtered.filter((tx) => {
        const amount = parseFloat(tx.value || 0);
        const min = parseFloat(filters.minAmount || 0);
        const max = parseFloat(filters.maxAmount || Infinity);
        return amount >= min && amount <= max;
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [transactions, searchTerm, filters]);

  // Get unique values for filter dropdowns
  const uniqueTokens = useMemo(() => {
    const tokens = [...new Set(transactions.filter((tx) => tx.tokenSymbol).map((tx) => tx.tokenSymbol))];
    return tokens.sort();
  }, [transactions]);

  const uniqueMethods = useMemo(() => {
    const methods = [...new Set(transactions.filter((tx) => tx.method).map((tx) => tx.method))];
    return methods.sort();
  }, [transactions]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Address validation and fetching
  const validateAndFetchData = async () => {
    if (!walletAddress.trim()) {
      setAddressError("Please enter a wallet address");
      return;
    }

    setAddressError("");

    // Validate address format
    const validation = await validateWalletAddress(walletAddress.trim());
    if (!validation.isValid) {
      setAddressError("Invalid Ethereum address format");
      return;
    }

    // Clear previous data and fetch new data
    clearData();
    setTransactions([]);
    setFilteredTransactions([]);
    setCurrentPage(1);

    try {
      await fetchWalletData(validation.checksumAddress || walletAddress.trim());
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    }
  };

  // Advanced filtering with API calls
  const handleAdvancedFilter = async () => {
    if (!walletAddress.trim()) {
      setAddressError("Please enter a wallet address first");
      return;
    }

    try {
      const filterParams = {
        address: walletAddress.trim(),
        limit: 1000,
        offset: 0,
        sortBy: "blockNumber",
        sortOrder: "desc",
      };

      // Add date range if specified
      if (filters.dateRange === "custom" && filters.customStartDate && filters.customEndDate) {
        filterParams.startDate = filters.customStartDate;
        filterParams.endDate = filters.customEndDate;
      } else if (filters.dateRange !== "all") {
        const days = {
          "1d": 1,
          "7d": 7,
          "30d": 30,
          "90d": 90,
        }[filters.dateRange];

        if (days) {
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);
          filterParams.startDate = startDate.toISOString().split("T")[0];
          filterParams.endDate = endDate.toISOString().split("T")[0];
        }
      }

      // Add other filters
      if (filters.transactionType !== "all") {
        filterParams.transactionType = filters.transactionType;
      }
      if (filters.tokenSymbol !== "all") {
        filterParams.tokenSymbol = filters.tokenSymbol;
      }
      if (filters.minAmount) {
        filterParams.minAmount = parseFloat(filters.minAmount);
      }
      if (filters.maxAmount) {
        filterParams.maxAmount = parseFloat(filters.maxAmount);
      }

      const result = await fetchTransactionsAdvanced(filterParams);
      if (result && result.transactions) {
        setTransactions(result.transactions);
      }
    } catch (err) {
      console.error("Error applying advanced filters:", err);
    }
  };

  // Export functions
  const handleExportCSV = async () => {
    if (!walletAddress.trim()) {
      setAddressError("Please enter a wallet address first");
      return;
    }

    setExporting(true);
    try {
      const success = await exportToCSV(walletAddress.trim(), filters);
      if (success) {
        // Show success message
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    if (!walletAddress.trim()) {
      setAddressError("Please enter a wallet address first");
      return;
    }

    setExporting(true);
    try {
      const success = await exportToJSON(walletAddress.trim(), filters);
      if (success) {
        // Show success message
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getTransactionIcon = (type, method) => {
    if (type === "send" || (method === "Transfer" && type === "out")) {
      return <ArrowUpRight className="text-red-400" size={16} />;
    } else if (type === "receive" || (method === "Transfer" && type === "in")) {
      return <ArrowDownLeft className="text-green-400" size={16} />;
    }
    return <Coins className="text-blue-400" size={16} />;
  };

  const refreshData = async () => {
    if (walletAddress.trim()) {
      await validateAndFetchData();
    }
  };

  return (
    <div className="bg-gradient-to-b  from-slate-900 via-slate-800 to-slate-900 rounded-xl py-10 border border-slate-700 shadow-2xl">
      {/* Address Input Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">Transaction Analysis</h2>
          <p className="text-slate-400">Enter an Ethereum address to analyze transaction history</p>
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
                  Analyzing...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Analyze Address
                </>
              )}
            </button>
          </div>

          {/* Quick address examples */}
          <div className="flex flex-wrap gap-2">
            <span className="text-slate-400 text-sm">Try:</span>
            {[
              { label: "Vitalik.eth", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
              { label: "Uniswap V3", address: "0xE592427A0AEce92De3Edee1F18E0157C05861564" },
            ].map((example) => (
              <button key={example.address} onClick={() => setWalletAddress(example.address)} className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded transition-colors">
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Summary */}
        {transactions.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Transactions</p>
                  <p className="text-2xl font-bold text-white">{filteredTransactions.length.toLocaleString()}</p>
                </div>
                <Activity className="text-blue-400" size={24} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Unique Tokens</p>
                  <p className="text-2xl font-bold text-white">{uniqueTokens.length + 1}</p>
                </div>
                <Coins className="text-green-400" size={24} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Methods Used</p>
                  <p className="text-2xl font-bold text-white">{uniqueMethods.length}</p>
                </div>
                <TrendingUp className="text-purple-400" size={24} />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Address</p>
                  <p className="text-lg font-bold text-white font-mono">{formatAddress(walletAddress)}</p>
                </div>
                <Wallet className="text-orange-400" size={24} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Section */}
      {transactions.length > 0 && (
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="text-slate-400">
                Latest {Math.min(itemsPerPage, filteredTransactions.length)} from a total of <span className="text-blue-400 font-semibold">{filteredTransactions.length.toLocaleString()}</span> transactions
              </p>
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

              <div className="relative">
                <button onClick={() => document.getElementById("exportDropdown").classList.toggle("hidden")} disabled={exporting} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50">
                  {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                  Export
                  <ChevronDown size={14} />
                </button>

                <div id="exportDropdown" className="hidden absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                  <button onClick={handleExportCSV} className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-t-lg">
                    Export as CSV
                  </button>
                  <button onClick={handleExportJSON} className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 rounded-b-lg">
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by hash, address, or token..."
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
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Date Range
                  </label>
                  <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="all">All Time</option>
                    <option value="1d">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {/* Transaction Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Transaction Type</label>
                  <select value={filters.transactionType} onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="all">All Types</option>
                    <option value="send">Send</option>
                    <option value="receive">Receive</option>
                    <option value="swap">Swap</option>
                  </select>
                </div>

                {/* Token Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Coins size={16} className="inline mr-2" />
                    Token
                  </label>
                  <select value={filters.tokenSymbol} onChange={(e) => setFilters({ ...filters, tokenSymbol: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="all">All Tokens</option>
                    <option value="">ETH</option>
                    {uniqueTokens.map((token) => (
                      <option key={token} value={token}>
                        {token}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Method Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Method</label>
                  <select value={filters.method} onChange={(e) => setFilters({ ...filters, method: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                    <option value="all">All Methods</option>
                    {uniqueMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Date Range */}
              {filters.dateRange === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                    <input type="date" value={filters.customStartDate} onChange={(e) => setFilters({ ...filters, customStartDate: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                    <input type="date" value={filters.customEndDate} onChange={(e) => setFilters({ ...filters, customEndDate: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              )}

              {/* Amount Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Min Amount</label>
                  <input type="number" step="any" placeholder="0.0" value={filters.minAmount} onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Max Amount</label>
                  <input type="number" step="any" placeholder="∞" value={filters.maxAmount} onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setFilters({
                      dateRange: "all",
                      customStartDate: "",
                      customEndDate: "",
                      transactionType: "all",
                      tokenSymbol: "all",
                      minAmount: "",
                      maxAmount: "",
                      method: "all",
                    })
                  }
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
                <button onClick={handleAdvancedFilter} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all">
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-blue-400" size={48} />
          <p className="text-slate-400">{loadingStep || "Loading transactions..."}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6">
          <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <div>
              <p className="text-red-400 font-medium">Error loading transactions</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && transactions.length === 0 && (
        <div className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
            <p className="text-slate-400 mb-6">Enter an Ethereum address above to start analyzing transaction history from the blockchain.</p>
            <div className="text-sm text-slate-500">
              <p>• View all ETH and token transactions</p>
              <p>• Filter by date, amount, and type</p>
              <p>• Export data in CSV or JSON format</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && transactions.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Transaction Hash</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Method</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Block</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Age</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">From</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">To</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-300">Txn Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {currentTransactions.map((tx, index) => (
                  <motion.tr key={tx.hash || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-slate-800 transition-colors">
                    {/* Transaction Hash */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(tx.type, tx.method)}
                        <button onClick={() => copyToClipboard(tx.hash)} className="text-blue-400 hover:text-blue-300 font-mono text-sm flex items-center gap-1">
                          {formatAddress(tx.hash)}
                          {copiedHash === tx.hash ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">{tx.method || "Transfer"}</span>
                    </td>

                    {/* Block */}
                    <td className="px-6 py-4">
                      <span className="text-blue-400 font-mono text-sm">{tx.blockNumber?.toLocaleString() || "-"}</span>
                    </td>

                    {/* Age */}
                    <td className="px-6 py-4">
                      <span className="text-slate-300 text-sm">{formatAge(tx.timestamp)}</span>
                    </td>

                    {/* From */}
                    <td className="px-6 py-4">
                      <button onClick={() => copyToClipboard(tx.from)} className="text-slate-300 hover:text-white font-mono text-sm flex items-center gap-1">
                        {formatAddress(tx.from)}
                        <ExternalLink size={12} />
                      </button>
                    </td>

                    {/* To */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyToClipboard(tx.to)} className="text-slate-300 hover:text-white font-mono text-sm flex items-center gap-1">
                          {formatAddress(tx.to)}
                          <ExternalLink size={12} />
                        </button>
                        {tx.to?.toLowerCase() === walletAddress.toLowerCase() && <span className="px-2 py-1 bg-orange-600 text-white rounded text-xs">IN</span>}
                        {tx.from?.toLowerCase() === walletAddress.toLowerCase() && <span className="px-2 py-1 bg-orange-600 text-white rounded text-xs">OUT</span>}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-mono">
                        {formatValue(tx.value)} {tx.tokenSymbol || "ETH"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">${(parseFloat(tx.value || 0) * (tx.tokenSymbol === "ETH" || !tx.tokenSymbol ? 3000 : 1)).toFixed(2)}</div>
                    </td>

                    {/* Txn Fee */}
                    <td className="px-6 py-4 text-right">
                      <div className="text-slate-300 font-mono text-sm">{tx.gasUsed ? `${((parseFloat(tx.gasUsed) * parseFloat(tx.gasPrice || 0)) / 1e18).toFixed(6)}` : "0.000000"}</div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length.toLocaleString()} transactions
                </span>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
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

export default TransactionsTable;
