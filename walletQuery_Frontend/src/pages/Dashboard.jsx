import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Layers,
  TrendingUp,
  Wallet,
  Activity,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  ExternalLink,
  Clock,
  Hash,
  ChevronDown,
  X,
  AlertCircle,
  Loader,
  RefreshCw,
  CalendarDays,
  Coins,
  Target,
  BarChart3,
  Settings,
  Download,
  Zap,
  Globe,
  Timer,
  Database,
  PieChart,
  LineChart,
} from "lucide-react";
import { useBlockchain } from "../core/hooks/useContext";
import { formatAddress, formatHash, formatTimestamp } from "../core/utils/Formatters";
import { copyToClipboard } from "../core/utils/HelperFunctions";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Filter states
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [selectedTokenFilter, setSelectedTokenFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [blockRange, setBlockRange] = useState({ min: "", max: "" });
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });

  // Advanced analytics states
  const [transactionPatterns, setTransactionPatterns] = useState(null);
  const [activityTimeline, setActivityTimeline] = useState(null);
  const [advancedResults, setAdvancedResults] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [availableTokens, setAvailableTokens] = useState([]);

  // Use blockchain context
  const {
    transactions,
    ethBalance,
    tokenTransactions,
    allTransactions,
    walletStats,
    walletAnalytics,
    currentWallet,
    loading,
    error,
    loadingStep,
    networkStatus,
    // Basic functions
    fetchTransactions,
    fetchTokenTransactions,
    fetchCurrentBalance,
    fetchWalletData,
    fetchExtendedWalletData,
    // Filtering functions
    fetchTransactionsByDateRange,
    fetchTransactionsByToken,
    fetchTransactionsByType,
    fetchTransactionsByBlockRange,
    fetchTransactionsByAmountRange,
    // Analytics functions
    fetchWalletAnalytics,
    fetchTransactionPatterns,
    fetchActivityTimeline,
    fetchTransactionsAdvanced,
    // Utility functions
    validateWalletAddress,
    fetchNetworkStatus,
    exportToCSV,
    exportToJSON,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    formatTransactions,
    getTransactionSummary,
    clearData,
    clearError,
    refreshWalletData,
  } = useBlockchain();

  // Debug logging for all context data
  useEffect(() => {
    console.log("🔍 Dashboard Debug - Context Data:", {
      transactions: transactions?.length || 0,
      ethBalance,
      tokenTransactions: tokenTransactions?.length || 0,
      allTransactions: allTransactions?.length || 0,
      walletStats,
      walletAnalytics,
      currentWallet,
      loading,
      error,
      loadingStep,
      networkStatus,
    });
  }, [transactions, ethBalance, tokenTransactions, allTransactions, walletStats, walletAnalytics, currentWallet, loading, error, networkStatus, loadingStep]);

  // Extract available tokens from transactions
  useEffect(() => {
    if (tokenTransactions && tokenTransactions.length > 0) {
      const tokens = [...new Set(tokenTransactions.map((tx) => tx.tokenSymbol).filter(Boolean))];
      setAvailableTokens(tokens);
      console.log("🪙 Available tokens:", tokens);
    }
  }, [tokenTransactions]);

  // Advanced filtering logic
  useEffect(() => {
    if (!allTransactions || allTransactions.length === 0) {
      setFilteredTransactions([]);
      return;
    }

    let filtered = [...allTransactions];
    console.log("🔄 Applying filters to", filtered.length, "transactions");

    // Date filter
    if (selectedDateFilter !== "all") {
      const now = Date.now();
      let cutoff;

      if (selectedDateFilter === "custom" && customDateRange.start && customDateRange.end) {
        const startTime = new Date(customDateRange.start).getTime();
        const endTime = new Date(customDateRange.end).getTime() + 24 * 60 * 60 * 1000;
        filtered = filtered.filter((tx) => {
          const txTime = tx.timestamp * 1000;
          return txTime >= startTime && txTime <= endTime;
        });
        console.log("📅 Custom date filter applied:", { startTime, endTime, results: filtered.length });
      } else {
        const timeRanges = {
          today: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          "3months": 90 * 24 * 60 * 60 * 1000,
          "6months": 180 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000,
        };

        cutoff = now - timeRanges[selectedDateFilter];
        filtered = filtered.filter((tx) => tx.timestamp * 1000 > cutoff);
        console.log("📅 Date filter applied:", { filter: selectedDateFilter, cutoff, results: filtered.length });
      }
    }

    // Block range filter
    if (blockRange.min || blockRange.max) {
      const minBlock = blockRange.min ? parseInt(blockRange.min) : 0;
      const maxBlock = blockRange.max ? parseInt(blockRange.max) : Infinity;
      filtered = filtered.filter((tx) => tx.blockNumber >= minBlock && tx.blockNumber <= maxBlock);
      console.log("🧱 Block range filter applied:", { minBlock, maxBlock, results: filtered.length });
    }

    // Transaction type filter
    if (selectedTypeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === selectedTypeFilter);
      console.log("⚡ Type filter applied:", { type: selectedTypeFilter, results: filtered.length });
    }

    // Token filter
    if (selectedTokenFilter !== "all") {
      if (selectedTokenFilter === "eth") {
        filtered = filtered.filter((tx) => !tx.tokenSymbol || tx.tokenSymbol === "ETH");
      } else {
        filtered = filtered.filter((tx) => tx.tokenSymbol === selectedTokenFilter);
      }
      console.log("🪙 Token filter applied:", { token: selectedTokenFilter, results: filtered.length });
    }

    // Amount range filter
    if (amountRange.min || amountRange.max) {
      const minAmount = amountRange.min ? parseFloat(amountRange.min) : 0;
      const maxAmount = amountRange.max ? parseFloat(amountRange.max) : Infinity;
      filtered = filtered.filter((tx) => {
        const value = parseFloat(tx.value || 0);
        return value >= minAmount && value <= maxAmount;
      });
      console.log("💰 Amount filter applied:", { minAmount, maxAmount, results: filtered.length });
    }

    setFilteredTransactions(filtered);
    console.log("✅ Final filtered transactions:", filtered.length);
  }, [allTransactions, selectedDateFilter, selectedTypeFilter, selectedTokenFilter, customDateRange, blockRange, amountRange]);

  // Handle wallet search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    console.log("🔍 Starting wallet search for:", searchQuery.trim());

    if (!searchQuery.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error("❌ Invalid address format");
      return;
    }

    clearError();

    try {
      // Validate address first
      const validation = await validateWalletAddress(searchQuery.trim());
      console.log("✅ Address validation:", validation);

      if (!validation.isValid) {
        throw new Error("Invalid Ethereum address");
      }

      // Fetch all wallet data
      const result = await fetchWalletData(searchQuery.trim());
      console.log("🎯 Wallet data fetched:", result);

      // Fetch network status
      const network = await fetchNetworkStatus();
      setNetworkInfo(network);
      console.log("🌐 Network status:", network);
    } catch (error) {
      console.error("❌ Search error:", error);
    }
  };

  // Handle advanced filter actions
  const handleDateRangeFilter = async () => {
    if (!currentWallet || !customDateRange.start || !customDateRange.end) return;

    console.log("🗓️ Applying date range filter:", customDateRange);
    try {
      const result = await fetchTransactionsByDateRange(currentWallet, customDateRange.start, customDateRange.end, selectedTypeFilter === "all" ? "all" : selectedTypeFilter);
      console.log("📅 Date range results:", result);

      // Update filtered transactions with results
      if (result && Array.isArray(result)) {
        setFilteredTransactions(result);
      }
    } catch (error) {
      console.error("❌ Date range filter error:", error);
    }
  };

  const handleTokenFilter = async (tokenSymbol) => {
    if (!currentWallet) return;

    console.log("🎯 Applying token filter:", tokenSymbol);
    setSelectedTokenFilter(tokenSymbol);

    if (tokenSymbol !== "all") {
      try {
        const result = await fetchTransactionsByToken(currentWallet, tokenSymbol);
        console.log("🪙 Token filter results:", result);

        if (result && Array.isArray(result)) {
          setFilteredTransactions(result);
        }
      } catch (error) {
        console.error("❌ Token filter error:", error);
      }
    }
  };

  const handleTypeFilter = async (type) => {
    if (!currentWallet) return;

    console.log("⚡ Applying type filter:", type);
    setSelectedTypeFilter(type);

    if (type !== "all") {
      try {
        const result = await fetchTransactionsByType(currentWallet, type);
        console.log("📊 Type filter results:", result);

        if (result && Array.isArray(result)) {
          setFilteredTransactions(result);
        }
      } catch (error) {
        console.error("❌ Type filter error:", error);
      }
    }
  };

  const handleBlockRangeFilter = async () => {
    if (!currentWallet || !blockRange.min || !blockRange.max) return;

    console.log("🧱 Applying block range filter:", blockRange);
    try {
      const result = await fetchTransactionsByBlockRange(currentWallet, parseInt(blockRange.min), parseInt(blockRange.max), selectedTypeFilter === "all" ? "all" : selectedTypeFilter);
      console.log("🔢 Block range results:", result);

      if (result && Array.isArray(result)) {
        setFilteredTransactions(result);
      }
    } catch (error) {
      console.error("❌ Block range filter error:", error);
    }
  };

  const handleAmountRangeFilter = async () => {
    if (!currentWallet || (!amountRange.min && !amountRange.max)) return;

    console.log("💰 Applying amount range filter:", amountRange);
    try {
      const result = await fetchTransactionsByAmountRange(currentWallet, parseFloat(amountRange.min) || 0, parseFloat(amountRange.max) || Infinity, selectedTokenFilter === "all" ? "all" : selectedTokenFilter);
      console.log("💵 Amount range results:", result);

      if (result && Array.isArray(result)) {
        setFilteredTransactions(result);
      }
    } catch (error) {
      console.error("❌ Amount range filter error:", error);
    }
  };

  // Fetch advanced analytics
  const handleFetchAnalytics = async () => {
    if (!currentWallet) return;

    console.log("📊 Fetching advanced analytics...");
    try {
      // Fetch transaction patterns
      const patterns = await fetchTransactionPatterns(currentWallet, "7d");
      setTransactionPatterns(patterns);
      console.log("📈 Transaction patterns:", patterns);

      // Fetch activity timeline
      const timeline = await fetchActivityTimeline(currentWallet, "daily", "7d");
      setActivityTimeline(timeline);
      console.log("📊 Activity timeline:", timeline);

      // Fetch comprehensive analytics
      const analytics = await fetchWalletAnalytics(currentWallet);
      console.log("🎯 Comprehensive analytics:", analytics);
    } catch (error) {
      console.error("❌ Analytics fetch error:", error);
    }
  };

  // Perform advanced search
  const handleAdvancedSearch = async () => {
    if (!currentWallet) return;

    console.log("🔍 Performing advanced search with filters:", {
      address: currentWallet,
      startDate: customDateRange.start,
      endDate: customDateRange.end,
      fromBlock: blockRange.min,
      toBlock: blockRange.max,
      transactionType: selectedTypeFilter === "all" ? undefined : selectedTypeFilter,
      tokenSymbol: selectedTokenFilter === "all" ? undefined : selectedTokenFilter,
      minAmount: amountRange.min,
      maxAmount: amountRange.max,
    });

    try {
      const filters = {
        address: currentWallet,
        startDate: customDateRange.start || undefined,
        endDate: customDateRange.end || undefined,
        fromBlock: blockRange.min ? parseInt(blockRange.min) : undefined,
        toBlock: blockRange.max ? parseInt(blockRange.max) : undefined,
        transactionType: selectedTypeFilter === "all" ? undefined : selectedTypeFilter,
        tokenSymbol: selectedTokenFilter === "all" ? undefined : selectedTokenFilter,
        minAmount: amountRange.min ? parseFloat(amountRange.min) : undefined,
        maxAmount: amountRange.max ? parseFloat(amountRange.max) : undefined,
        limit: 100,
        sortBy: "blockNumber",
        sortOrder: "desc",
      };

      const result = await fetchTransactionsAdvanced(filters);
      setAdvancedResults(result);
      console.log("🚀 Advanced search results:", result);

      if (result?.transactions) {
        setFilteredTransactions(result.transactions);
      }
    } catch (error) {
      console.error("❌ Advanced search error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearAllFilters = () => {
    console.log("🧹 Clearing all filters");
    setSelectedDateFilter("all");
    setSelectedTypeFilter("all");
    setSelectedTokenFilter("all");
    setCustomDateRange({ start: "", end: "" });
    setBlockRange({ min: "", max: "" });
    setAmountRange({ min: "", max: "" });
    setAdvancedResults(null);
    setFilteredTransactions(allTransactions || []);
  };

  const handleExport = async (format = "csv") => {
    if (!currentWallet || !filteredTransactions.length) return;

    console.log(`📁 Exporting ${filteredTransactions.length} transactions as ${format}`);

    try {
      if (format === "csv") {
        await exportToCSV(currentWallet, {
          transactions: filteredTransactions,
        });
      } else {
        await exportToJSON(currentWallet, {
          transactions: filteredTransactions,
        });
      }
      console.log("✅ Export successful");
    } catch (error) {
      console.error("❌ Export error:", error);
    }
  };

  // Utility functions
  // const formatAddress = (address) => {
  //   if (!address) return "";
  //   return `${address.slice(0, 6)}...${address.slice(-4)}`;
  // };

  // const formatHash = (hash) => {
  //   if (!hash) return "";
  //   return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  // };

  // const formatTimestamp = (timestamp) => {
  //   return new Date(timestamp * 1000).toLocaleString();
  // };

  // const copyToClipboard = async (text) => {
  //   try {
  //     await navigator.clipboard.writeText(text);
  //     console.log("📋 Copied to clipboard:", text);
  //   } catch (err) {
  //     console.error("❌ Copy failed:", err);
  //   }
  // };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "send":
        return ArrowUpRight;
      case "receive":
        return ArrowDownLeft;
      case "swap":
        return Activity;
      default:
        return Activity;
    }
  };

  const getTransactionColor = (type) => {
    switch (type?.toLowerCase()) {
      case "send":
        return "text-red-400";
      case "receive":
        return "text-green-400";
      case "swap":
        return "text-blue-400";
      default:
        return "text-slate-400";
    }
  };

  const getTransactionBg = (type) => {
    switch (type?.toLowerCase()) {
      case "send":
        return "bg-red-500 bg-opacity-20";
      case "receive":
        return "bg-green-500 bg-opacity-20";
      case "swap":
        return "bg-blue-500 bg-opacity-20";
      default:
        return "bg-slate-500 bg-opacity-20";
    }
  };

  // Calculate dynamic stats from actual data
  const calculateStats = () => {
    const stats = [
      {
        id: 1,
        title: "ETH Balance",
        value: ethBalance ? `${parseFloat(ethBalance).toFixed(4)} ETH` : "0 ETH",
        subtitle: walletStats?.totalBalance ? `≈ $${(parseFloat(ethBalance || 0) * 3000).toFixed(2)}` : "",
        change: ethBalance && parseFloat(ethBalance) > 0 ? "+0.0%" : "0.0%",
        changeType: "neutral",
        icon: Wallet,
        gradient: "from-blue-500 to-purple-600",
      },
      {
        id: 2,
        title: "Portfolio Value",
        value: `$${
          walletStats?.portfolioValue?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || "0.00"
        }`,
        subtitle: `${walletStats?.connectedTokens || 0} tokens`,
        change: walletStats?.portfolioValue > 0 ? "+0.0%" : "0.0%",
        changeType: "neutral",
        icon: TrendingUp,
        gradient: "from-green-500 to-emerald-600",
      },
      {
        id: 3,
        title: "Total Transactions",
        value: walletStats?.totalTransactions?.toString() || allTransactions?.length?.toString() || "0",
        subtitle: `${walletStats?.ethTransactions || 0} ETH, ${walletStats?.tokenTransactions || 0} tokens`,
        change: allTransactions?.length > 0 ? `+${allTransactions.length}` : "0",
        changeType: allTransactions?.length > 0 ? "positive" : "neutral",
        icon: Activity,
        gradient: "from-orange-500 to-red-600",
      },
      {
        id: 4,
        title: "Recent Activity",
        value: walletAnalytics?.activity?.last24Hours?.toString() || walletStats?.recentActivity?.toString() || "0",
        subtitle: `${walletAnalytics?.activity?.lastHour || 0} last hour`,
        change: walletStats?.recentActivity > 0 ? `+${walletStats.recentActivity}` : "0",
        changeType: walletStats?.recentActivity > 0 ? "positive" : "neutral",
        icon: Zap,
        gradient: "from-purple-500 to-pink-600",
      },
    ];

    console.log("📊 Calculated stats:", stats);
    return stats;
  };

  const stats = calculateStats();

  // Filter options
  const filterOptions = {
    date: [
      { value: "all", label: "All Time" },
      { value: "today", label: "Today" },
      { value: "week", label: "Last Week" },
      { value: "month", label: "Last Month" },
      { value: "3months", label: "Last 3 Months" },
      { value: "6months", label: "Last 6 Months" },
      { value: "year", label: "Last Year" },
      { value: "custom", label: "Custom Range" },
    ],
    type: [
      { value: "all", label: "All Types" },
      { value: "send", label: "Sent" },
      { value: "receive", label: "Received" },
      { value: "swap", label: "Swaps" },
    ],
  };

  return (
    <div className=" rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Web3 Dashboard</h1>
          <p className="text-slate-400">Monitor your wallet activity and manage your decentralized assets</p>
          {currentWallet && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-slate-300">Current Wallet:</span>
              <span className="text-blue-400 font-mono">{formatAddress(currentWallet)}</span>
              <button onClick={() => copyToClipboard(currentWallet)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <Copy size={16} />
              </button>
              <button onClick={clearData} className="ml-4 text-red-400 hover:text-red-300 transition-colors">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Wallet Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0x... (e.g., 0x1234567890abcdef1234567890abcdef12345678)"
                  className="w-full px-4 py-3 pl-12 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end space-x-2">
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-2">
                  {loading ? <Loader size={18} className="animate-spin" /> : <Search size={18} />}
                  <span>{loading ? "Analyzing..." : "Analyze Wallet"}</span>
                </div>
              </button>

              {allTransactions && allTransactions.length > 0 && (
                <>
                  <button onClick={() => setShowFilters(!showFilters)} className={`px-6 py-3 border border-slate-600 rounded-xl font-medium transition-all duration-200 shadow-lg ${showFilters ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"}`}>
                    <div className="flex items-center space-x-2">
                      <Filter size={18} />
                      <span>Filters</span>
                    </div>
                  </button>

                  <button onClick={() => setShowAnalytics(!showAnalytics)} className={`px-6 py-3 border border-slate-600 rounded-xl font-medium transition-all duration-200 shadow-lg ${showAnalytics ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"}`}>
                    <div className="flex items-center space-x-2">
                      <BarChart3 size={18} />
                      <span>Analytics</span>
                    </div>
                  </button>

                  <button onClick={() => handleExport("csv")} disabled={!filteredTransactions.length} className="px-6 py-3 border border-slate-600 rounded-xl font-medium transition-all duration-200 shadow-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50">
                    <div className="flex items-center space-x-2">
                      <Download size={18} />
                      <span>Export</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Loading Step Display */}
          {loading && loadingStep && (
            <div className="mt-4 p-3 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg flex items-center space-x-2">
              <Loader size={16} className="text-blue-400 animate-spin" />
              <span className="text-blue-400 text-sm">{loadingStep}</span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-400" />
              <span className="text-red-400">{error}</span>
              <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-300">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Network Status */}
          {networkStatus && (
            <div className="mt-4 p-3 bg-green-900 bg-opacity-20 border border-green-700 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Network: {networkStatus.network}</span>
                <span className="text-green-400">Block: {networkStatus.blockNumber?.toLocaleString()}</span>
                <span className="text-green-400">Chain ID: {networkStatus.chainId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {currentWallet && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} bg-opacity-20`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className={`text-sm font-medium ${stat.changeType === "positive" ? "text-green-400" : stat.changeType === "negative" ? "text-red-400" : "text-slate-400"}`}>{stat.change}</div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-slate-400 text-sm">{stat.title}</p>
                  {stat.subtitle && <p className="text-slate-500 text-xs mt-1">{stat.subtitle}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Analytics Panel */}
        {showAnalytics && currentWallet && (
          <div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <BarChart3 size={24} className="mr-2" />
                Advanced Analytics
              </h3>
              <button onClick={handleFetchAnalytics} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                <div className="flex items-center space-x-2">
                  {loading ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  <span>Refresh Analytics</span>
                </div>
              </button>
            </div>

            {/* Wallet Analytics Display */}
            {walletAnalytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Overview */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Globe size={18} className="mr-2" />
                    Overview
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Transactions:</span>
                      <span className="text-white font-medium">{walletAnalytics.overview?.totalTransactions || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">ETH Transactions:</span>
                      <span className="text-blue-400 font-medium">{walletAnalytics.overview?.ethTransactions || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Token Transactions:</span>
                      <span className="text-green-400 font-medium">{walletAnalytics.overview?.tokenTransactions || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Connected Tokens:</span>
                      <span className="text-purple-400 font-medium">{walletAnalytics.overview?.connectedTokens || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Activity size={18} className="mr-2" />
                    Activity
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last Hour:</span>
                      <span className="text-green-400 font-medium">{walletAnalytics.activity?.lastHour || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last 6 Hours:</span>
                      <span className="text-yellow-400 font-medium">{walletAnalytics.activity?.last6Hours || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Last 24 Hours:</span>
                      <span className="text-blue-400 font-medium">{walletAnalytics.activity?.last24Hours || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Token Analysis */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Coins size={18} className="mr-2" />
                    Token Analysis
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Unique Tokens:</span>
                      <span className="text-purple-400 font-medium">{walletAnalytics.tokens?.uniqueTokens || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Most Active:</span>
                      <span className="text-green-400 font-medium">{walletAnalytics.tokens?.mostActiveToken || "N/A"}</span>
                    </div>
                    {walletAnalytics.tokens?.tokenDistribution && Object.keys(walletAnalytics.tokens.tokenDistribution).length > 0 && (
                      <div className="mt-3">
                        <span className="text-slate-400 text-xs">Token Distribution:</span>
                        <div className="mt-2 space-y-1">
                          {Object.entries(walletAnalytics.tokens.tokenDistribution)
                            .slice(0, 3)
                            .map(([token, count]) => (
                              <div key={token} className="flex justify-between text-xs">
                                <span className="text-slate-500">{token}:</span>
                                <span className="text-slate-300">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transaction Patterns */}
                {walletAnalytics.patterns && (
                  <div className="bg-slate-900 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <TrendingUp size={18} className="mr-2" />
                      ETH Patterns
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">ETH Sent:</span>
                        <span className="text-red-400 font-medium">{walletAnalytics.patterns.ethSent || 0} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">ETH Received:</span>
                        <span className="text-green-400 font-medium">{walletAnalytics.patterns.ethReceived || 0} ETH</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2">{walletAnalytics.patterns.dataScope}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Analytics Data */}
            {transactionPatterns && (
              <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <LineChart size={18} className="mr-2" />
                  Transaction Patterns
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{transactionPatterns.totalTransactions || 0}</div>
                    <div className="text-slate-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{transactionPatterns.averagePerHour || 0}</div>
                    <div className="text-slate-400">Avg/Hour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-purple-400">{transactionPatterns.timeScope || "N/A"}</div>
                    <div className="text-slate-400">Time Scope</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">{transactionPatterns.note}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            {activityTimeline && activityTimeline.length > 0 && (
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Timer size={18} className="mr-2" />
                  Activity Timeline
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activityTimeline.slice(0, 5).map((timeline, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-slate-800 rounded p-2">
                      <span className="text-slate-400">{new Date(timeline.timestamp).toLocaleString()}</span>
                      <div className="flex space-x-4">
                        <span className="text-blue-400">ETH: {timeline.ethTransactions}</span>
                        <span className="text-green-400">Tokens: {timeline.tokenTransactions}</span>
                        <span className="text-purple-400">Vol: {parseFloat(timeline.totalVolume || 0).toFixed(4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && allTransactions && allTransactions.length > 0 && (
          <div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Filter size={24} className="mr-2" />
                Transaction Filters
              </h3>
              <button onClick={clearAllFilters} className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm">
                Clear All Filters
              </button>
            </div>

            {/* Basic Filters Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Date Range
                </label>
                <select
                  value={selectedDateFilter}
                  onChange={(e) => {
                    setSelectedDateFilter(e.target.value);
                    console.log("📅 Date filter changed:", e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filterOptions.date.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Activity size={16} className="inline mr-2" />
                  Transaction Type
                </label>
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => {
                    handleTypeFilter(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filterOptions.type.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Token Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Coins size={16} className="inline mr-2" />
                  Token
                </label>
                <select
                  value={selectedTokenFilter}
                  onChange={(e) => {
                    handleTokenFilter(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tokens</option>
                  <option value="eth">ETH Only</option>
                  {availableTokens.map((token) => (
                    <option key={token} value={token}>
                      {token}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Date Range */}
            {selectedDateFilter === "custom" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                  <input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange((prev) => ({ ...prev, start: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                  <input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-end">
                  <button onClick={handleDateRangeFilter} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Date Filter
                  </button>
                </div>
              </div>
            )}

            {/* Advanced Filters Toggle */}
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                <div className="flex items-center space-x-2">
                  <Settings size={16} />
                  <span>Advanced Filters</span>
                  <ChevronDown size={16} className={`transform transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
                </div>
              </button>

              <button onClick={handleAdvancedSearch} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                <div className="flex items-center space-x-2">
                  {loading ? <Loader size={16} className="animate-spin" /> : <Target size={16} />}
                  <span>Advanced Search</span>
                </div>
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-900 rounded-lg border border-slate-600">
                {/* Block Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Layers size={16} className="inline mr-2" />
                    Block Range
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="number"
                      placeholder="Min block"
                      value={blockRange.min}
                      onChange={(e) => setBlockRange((prev) => ({ ...prev, min: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max block"
                      value={blockRange.max}
                      onChange={(e) => setBlockRange((prev) => ({ ...prev, max: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button onClick={handleBlockRangeFilter} disabled={!blockRange.min || !blockRange.max || loading} className="w-full px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
                    Apply Block Filter
                  </button>
                </div>

                {/* Amount Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    Amount Range
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Min amount"
                      value={amountRange.min}
                      onChange={(e) => setAmountRange((prev) => ({ ...prev, min: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Max amount"
                      value={amountRange.max}
                      onChange={(e) => setAmountRange((prev) => ({ ...prev, max: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button onClick={handleAmountRangeFilter} disabled={(!amountRange.min && !amountRange.max) || loading} className="w-full px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50">
                    Apply Amount Filter
                  </button>
                </div>

                {/* Filter Summary */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <BarChart3 size={16} className="inline mr-2" />
                    Filter Summary
                  </label>
                  <div className="p-3 bg-slate-800 border border-slate-600 rounded-lg">
                    <div className="text-sm text-slate-400">
                      Showing {filteredTransactions.length} of {allTransactions.length} transactions
                    </div>
                    {(selectedDateFilter !== "all" || selectedTypeFilter !== "all" || selectedTokenFilter !== "all") && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedDateFilter !== "all" && <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">{filterOptions.date.find((d) => d.value === selectedDateFilter)?.label}</span>}
                        {selectedTypeFilter !== "all" && <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">{selectedTypeFilter}</span>}
                        {selectedTokenFilter !== "all" && <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">{selectedTokenFilter}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Search Results */}
            {advancedResults && (
              <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-600">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Database size={18} className="mr-2" />
                  Advanced Search Results
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{advancedResults.total || 0}</div>
                    <div className="text-slate-400">Total Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{advancedResults.page || 1}</div>
                    <div className="text-slate-400">Current Page</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{advancedResults.totalPages || 1}</div>
                    <div className="text-slate-400">Total Pages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-yellow-400">{advancedResults.hasNextPage ? "Yes" : "No"}</div>
                    <div className="text-slate-400">Has More</div>
                  </div>
                </div>
                {advancedResults.metadata && (
                  <div className="mt-2 text-xs text-slate-500">
                    {advancedResults.metadata.dataScope} | Limit: {advancedResults.metadata.actualLimit}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Action Cards */}
        {currentWallet && !loading && allTransactions && allTransactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <button
              onClick={() => {
                setSelectedDateFilter("month");
                setSelectedTypeFilter("all");
                setSelectedTokenFilter("all");
              }}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 text-left group hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 bg-opacity-20">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Monthly Analysis</h3>
                  <p className="text-slate-400 text-sm">View this month's activity</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                handleTokenFilter("eth");
              }}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 text-left group hover:scale-105"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 bg-opacity-20">
                  <DollarSign className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">ETH Only</h3>
                  <p className="text-slate-400 text-sm">Focus on ETH transactions</p>
                </div>
              </div>
            </button>

            <button onClick={() => handleTypeFilter("receive")} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 text-left group hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 bg-opacity-20">
                  <ArrowDownLeft className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Received Only</h3>
                  <p className="text-slate-400 text-sm">Show incoming transactions</p>
                </div>
              </div>
            </button>

            <button onClick={() => handleExport("csv")} disabled={!filteredTransactions.length} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 text-left group hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 bg-opacity-20">
                  <Download className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Export Data</h3>
                  <p className="text-slate-400 text-sm">Download filtered results</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 shadow-xl text-center">
            <Loader size={48} className="mx-auto text-blue-400 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{loadingStep || "Fetching Wallet Data"}</h3>
            <p className="text-slate-400">{loadingStep ? "Please wait while we process your request..." : "Analyzing blockchain transactions..."}</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !currentWallet && (
          <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 shadow-xl text-center">
            <Search size={48} className="mx-auto text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Search for a Wallet</h3>
            <p className="text-slate-400">Enter an Ethereum wallet address above to view transactions and balances</p>
          </div>
        )}

        {/* Transactions Table */}
        {currentWallet && !loading && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {filteredTransactions.length !== allTransactions?.length ? "Filtered Transactions" : "Recent Transactions"}
                  {filteredTransactions.length > 0 && <span className="text-slate-400 text-sm font-normal ml-2">({filteredTransactions.length} transactions)</span>}
                </h2>
                <div className="flex items-center space-x-2">
                  <button onClick={() => refreshWalletData()} disabled={loading} className="text-slate-400 hover:text-white transition-colors duration-200 disabled:opacity-50">
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                  </button>
                  <button className="text-slate-400 hover:text-white transition-colors duration-200">
                    <ExternalLink size={20} />
                  </button>
                </div>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <Activity size={48} className="mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Transactions Found</h3>
                <p className="text-slate-400">{allTransactions && allTransactions.length === 0 ? "This wallet has no transactions in the analyzed period" : "No transactions match your current filters"}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {filteredTransactions.slice(0, 20).map((tx, index) => {
                  const Icon = getTransactionIcon(tx.type);
                  const colorClass = getTransactionColor(tx.type);
                  const bgClass = getTransactionBg(tx.type);

                  return (
                    <div key={tx.hash || index} className="p-6 hover:bg-slate-750 transition-all duration-200 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Transaction Icon */}
                          <div className={`p-3 rounded-xl ${bgClass}`}>
                            <Icon className={colorClass} size={20} />
                          </div>

                          {/* Transaction Details */}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium capitalize">{tx.type || "unknown"}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-400 text-sm">{formatTimestamp(tx.timestamp)}</span>
                              {tx.tokenSymbol && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-purple-400 text-sm">{tx.tokenSymbol}</span>
                                </>
                              )}
                            </div>

                            {tx.hash && (
                              <div className="flex items-center space-x-2 mt-1">
                                <Hash size={14} className="text-slate-500" />
                                <span className="text-slate-400 text-sm font-mono">{formatHash(tx.hash)}</span>
                                <button onClick={() => copyToClipboard(tx.hash)} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Copy size={14} className="text-slate-500 hover:text-slate-300" />
                                </button>
                              </div>
                            )}

                            {tx.blockNumber && (
                              <div className="flex items-center space-x-2 mt-1">
                                <Layers size={14} className="text-slate-500" />
                                <span className="text-slate-400 text-sm">Block {tx.blockNumber?.toLocaleString()}</span>
                              </div>
                            )}

                            {/* Address info */}
                            <div className="flex items-center space-x-2 mt-1">
                              <Users size={14} className="text-slate-500" />
                              <span className="text-slate-400 text-xs">
                                {tx.type === "send" && tx.to
                                  ? `To: ${formatAddress(tx.to)}`
                                  : tx.type === "receive" && tx.from
                                  ? `From: ${formatAddress(tx.from)}`
                                  : tx.contractAddress
                                  ? `Contract: ${formatAddress(tx.contractAddress)}`
                                  : tx.from && tx.to
                                  ? `${formatAddress(tx.from)} → ${formatAddress(tx.to)}`
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount and Status */}
                        <div className="text-right">
                          <div className={`text-lg font-bold ${colorClass}`}>
                            {tx.type === "send" ? "-" : tx.type === "receive" ? "+" : ""}
                            {tx.value || "0"} {tx.tokenSymbol || "ETH"}
                          </div>
                          <div className="flex items-center justify-end space-x-2 mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-slate-400 text-sm">Confirmed</span>
                          </div>
                          {tx.gasUsed && <div className="text-slate-500 text-xs mt-1">Gas: {parseInt(tx.gasUsed).toLocaleString()}</div>}
                          {tx.contractAddress && <div className="text-slate-500 text-xs mt-1">Contract: {formatAddress(tx.contractAddress)}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* View All Button */}
            {filteredTransactions.length > 20 && (
              <div className="p-6 border-t border-slate-700 text-center">
                <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">View All {filteredTransactions.length} Transactions →</button>
              </div>
            )}
          </div>
        )}

        {/* Extended Wallet Information */}
        {currentWallet && !loading && (transactions?.length > 0 || tokenTransactions?.length > 0) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ETH Transactions Summary */}
            {transactions && transactions.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">ETH Transactions</h3>
                  <div className="p-2 rounded-lg bg-blue-500 bg-opacity-20">
                    <Activity className="text-blue-400" size={20} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Count:</span>
                    <span className="text-white font-medium">{transactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sent:</span>
                    <span className="text-red-400 font-medium">{transactions.filter((tx) => tx.type === "send").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Received:</span>
                    <span className="text-green-400 font-medium">{transactions.filter((tx) => tx.type === "receive").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Value:</span>
                    <span className="text-blue-400 font-medium">{transactions.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0).toFixed(4)} ETH</span>
                  </div>
                </div>
              </div>
            )}

            {/* Token Transactions Summary */}
            {tokenTransactions && tokenTransactions.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Token Transactions</h3>
                  <div className="p-2 rounded-lg bg-purple-500 bg-opacity-20">
                    <Coins className="text-purple-400" size={20} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Count:</span>
                    <span className="text-white font-medium">{tokenTransactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unique Tokens:</span>
                    <span className="text-purple-400 font-medium">{availableTokens.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Most Active:</span>
                    <span className="text-green-400 font-medium">{walletAnalytics?.tokens?.mostActiveToken || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recent (24h):</span>
                    <span className="text-blue-400 font-medium">
                      {
                        tokenTransactions.filter((tx) => {
                          const txTime = new Date(tx.timestamp * 1000);
                          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                          return txTime > dayAgo;
                        }).length
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Insights */}
            {walletAnalytics && (
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Wallet Insights</h3>
                  <div className="p-2 rounded-lg bg-green-500 bg-opacity-20">
                    <PieChart className="text-green-400" size={20} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Analysis Scope:</span>
                    <span className="text-yellow-400 font-medium text-xs">{walletAnalytics.patterns?.dataScope || "Recent data"}</span>
                  </div>
                  {walletAnalytics.patterns && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ETH Sent:</span>
                        <span className="text-red-400 font-medium">{walletAnalytics.patterns.ethSent || 0} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ETH Received:</span>
                        <span className="text-green-400 font-medium">{walletAnalytics.patterns.ethReceived || 0} ETH</span>
                      </div>
                    </>
                  )}
                  {walletAnalytics.metadata?.note && <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-900 rounded">ℹ️ {walletAnalytics.metadata.note}</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Extended Actions */}
        {currentWallet && !loading && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => fetchExtendedWalletData(currentWallet, 7)} disabled={loading} className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 border border-slate-700 transition-all duration-200 text-left disabled:opacity-50">
              <div className="flex items-center space-x-3">
                <Clock className="text-blue-400" size={20} />
                <div>
                  <h4 className="text-white font-medium">Extended History</h4>
                  <p className="text-slate-400 text-sm">Load 7-day history</p>
                </div>
              </div>
            </button>

            <button onClick={handleFetchAnalytics} disabled={loading} className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 border border-slate-700 transition-all duration-200 text-left disabled:opacity-50">
              <div className="flex items-center space-x-3">
                <BarChart3 className="text-green-400" size={20} />
                <div>
                  <h4 className="text-white font-medium">Deep Analytics</h4>
                  <p className="text-slate-400 text-sm">Patterns & timeline</p>
                </div>
              </div>
            </button>

            <button onClick={() => handleExport("json")} disabled={!filteredTransactions.length || loading} className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 border border-slate-700 transition-all duration-200 text-left disabled:opacity-50">
              <div className="flex items-center space-x-3">
                <Download className="text-purple-400" size={20} />
                <div>
                  <h4 className="text-white font-medium">Export JSON</h4>
                  <p className="text-slate-400 text-sm">Download as JSON</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                // Fetch all available tokens for this wallet
                if (availableTokens.length > 0) {
                  console.log("🪙 Available tokens for filtering:", availableTokens);
                  setSelectedTokenFilter(availableTokens[0]);
                  handleTokenFilter(availableTokens[0]);
                }
              }}
              disabled={!availableTokens.length || loading}
              className="bg-slate-800 hover:bg-slate-700 rounded-xl p-4 border border-slate-700 transition-all duration-200 text-left disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <Target className="text-orange-400" size={20} />
                <div>
                  <h4 className="text-white font-medium">Token Focus</h4>
                  <p className="text-slate-400 text-sm">{availableTokens.length > 0 ? `Filter by ${availableTokens[0]}` : "No tokens found"}</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Debug Information */}
        {currentWallet && !loading && (
          <div className="mt-8 bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Database size={20} className="mr-2" />
                Debug Information
              </h3>
              <button
                onClick={() => {
                  console.log("🔍 Full Debug Data Dump:");
                  console.log("Current Wallet:", currentWallet);
                  console.log("ETH Balance:", ethBalance);
                  console.log("Transactions:", transactions);
                  console.log("Token Transactions:", tokenTransactions);
                  console.log("All Transactions:", allTransactions);
                  console.log("Wallet Stats:", walletStats);
                  console.log("Wallet Analytics:", walletAnalytics);
                  console.log("Filtered Transactions:", filteredTransactions);
                  console.log("Available Tokens:", availableTokens);
                  console.log("Network Status:", networkStatus);
                  console.log("Transaction Patterns:", transactionPatterns);
                  console.log("Activity Timeline:", activityTimeline);
                  console.log("Advanced Results:", advancedResults);
                }}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Console Log All Data
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400">ETH Transactions</div>
                <div className="text-white font-bold text-lg">{transactions?.length || 0}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400">Token Transactions</div>
                <div className="text-white font-bold text-lg">{tokenTransactions?.length || 0}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400">All Transactions</div>
                <div className="text-white font-bold text-lg">{allTransactions?.length || 0}</div>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="text-slate-400">Filtered Results</div>
                <div className="text-white font-bold text-lg">{filteredTransactions?.length || 0}</div>
              </div>
            </div>

            {/* Raw Data Preview */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">Wallet Stats Keys:</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  {walletStats &&
                    Object.keys(walletStats).map((key) => (
                      <div key={key}>
                        <span className="text-slate-500">{key}:</span>
                        <span className="text-slate-300 ml-2">{JSON.stringify(walletStats[key])}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">Analytics Keys:</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  {walletAnalytics &&
                    Object.keys(walletAnalytics).map((key) => (
                      <div key={key}>
                        <span className="text-slate-500">{key}:</span>
                        <span className="text-slate-300 ml-2">{typeof walletAnalytics[key] === "object" ? `{${Object.keys(walletAnalytics[key]).join(", ")}}` : JSON.stringify(walletAnalytics[key])}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extended Functionality Panel */}
        {currentWallet && !loading && (
          <div className="mt-8 bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings size={20} className="mr-2" />
              Extended Functions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fetch by Date Range */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Date Range Search</h4>
                <div className="space-y-2">
                  <input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange((prev) => ({ ...prev, start: e.target.value }))} className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="Start date" />
                  <input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))} className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="End date" />
                  <button onClick={handleDateRangeFilter} disabled={!customDateRange.start || !customDateRange.end || loading} className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
                    Search Date Range
                  </button>
                </div>
              </div>

              {/* Fetch by Block Range */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Block Range Search</h4>
                <div className="space-y-2">
                  <input type="number" value={blockRange.min} onChange={(e) => setBlockRange((prev) => ({ ...prev, min: e.target.value }))} className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="From block" />
                  <input type="number" value={blockRange.max} onChange={(e) => setBlockRange((prev) => ({ ...prev, max: e.target.value }))} className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="To block" />
                  <button onClick={handleBlockRangeFilter} disabled={!blockRange.min || !blockRange.max || loading} className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50">
                    Search Block Range
                  </button>
                </div>
              </div>

              {/* Fetch by Amount Range */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Amount Range Search</h4>
                <div className="space-y-2">
                  <input type="number" step="0.0001" value={amountRange.min} onChange={(e) => setAmountRange((prev) => ({ ...prev, min: e.target.value }))} className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="Min amount" />
                  <input type="number" step="0.0001" value={amountRange.max} onChange={(e) => setAmountRange((prev) => ({ ...prev, max: e.target.value }))} className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm" placeholder="Max amount" />
                  <button onClick={handleAmountRangeFilter} disabled={(!amountRange.min && !amountRange.max) || loading} className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors disabled:opacity-50">
                    Search Amount Range
                  </button>
                </div>
              </div>
            </div>

            {/* Available Tokens Quick Actions */}
            {availableTokens.length > 0 && (
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Quick Token Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {availableTokens.map((token) => (
                    <button key={token} onClick={() => handleTokenFilter(token)} className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedTokenFilter === token ? "bg-purple-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
                      {token}
                    </button>
                  ))}
                  <button onClick={() => handleTokenFilter("all")} className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedTokenFilter === "all" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
                    All Tokens
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
