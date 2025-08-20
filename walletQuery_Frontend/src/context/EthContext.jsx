import React, { createContext, useContext, useState } from "react";
import {
  getTransactions,
  getBalance,
  getBalanceAtDate,
  getTokenTransactions,
  getTokenBalanceAtDate,
  getCurrentBalance,
  getAllTransactions,
  getInternalTransactions,
  getNFTTransactions,
  getERC1155Transactions,
  getMultipleBalances,
  getAddressFundedBy,
  getMinedBlocks,
  getBeaconWithdrawals,
  getExtendedTransactions,
  getExtendedTokenTransactions,
  getTransactionsByDateRange,
  getTransactionsByToken,
  getTransactionsByType,
  getTransactionsByBlockRange,
  getTransactionsByAmountRange,
  getWalletAnalytics,
  getTransactionPatterns,
  getActivityTimeline,
  getTransactionsAdvanced,
  validateAddress,
  getNetworkStatus,
  exportTransactionsCSV,
  exportTransactionsJSON,
  subscribeToWalletUpdates,
  formatTransactionData,
  calculateTransactionSummary,
} from "../apis/eth.api.js";

// Create context
const BlockchainContext = createContext();

// Provider component
const BlockchainProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [ethBalance, setEthBalance] = useState(null);
  const [tokenTransactions, setTokenTransactions] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [internalTransactions, setInternalTransactions] = useState([]);
  const [nftTransactions, setNFTTransactions] = useState([]);
  const [erc1155Transactions, setERC1155Transactions] = useState([]);
  const [beaconWithdrawals, setBeaconWithdrawals] = useState([]);
  const [multipleBalances, setMultipleBalances] = useState([]);
  const [addressFundingInfo, setAddressFundingInfo] = useState(null);
  const [minedBlocks, setMinedBlocks] = useState([]);
  const [walletStats, setWalletStats] = useState({
    totalBalance: 0,
    portfolioValue: 0,
    activeTransactions: 0,
    connectedDApps: 0,
  });
  const [walletAnalytics, setWalletAnalytics] = useState(null);
  const [currentWallet, setCurrentWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState("");
  const [networkStatus, setNetworkStatus] = useState(null);

  // ===== BASIC API CALLS =====

  // Fetch recent transactions (default: last 24 hours)
  const fetchTransactions = async (address, fromBlock = null) => {
    setLoadingStep("Fetching ETH transactions...");
    setError(null);
    try {
      const data = await getTransactions(address, fromBlock);
      setTransactions(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch transactions");
      console.error("Error fetching transactions:", err);
      throw err;
    }
  };

  // Fetch current balance
  const fetchBalance = async (address) => {
    setLoadingStep("Fetching current balance...");
    setError(null);
    try {
      const data = await getBalance(address);
      setEthBalance(data.balance);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch balance");
      console.error("Error fetching balance:", err);
      throw err;
    }
  };

  const fetchBalanceAtDate = async (address, date) => {
    setLoadingStep("Fetching balance at date...");
    setError(null);
    try {
      const data = await getBalanceAtDate(address, date);
      setEthBalance(data.balance);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch balance");
      console.error("Error fetching balance:", err);
      throw err;
    }
  };

  // Fetch recent token transactions (default: last 24 hours)
  const fetchTokenTransactions = async (address, fromBlock = null) => {
    setLoadingStep("Fetching token transactions...");
    setError(null);
    try {
      const data = await getTokenTransactions(address, fromBlock);
      setTokenTransactions(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch token transactions");
      console.error("Error fetching token transactions:", err);
      throw err;
    }
  };

  const fetchTokenBalanceAtDate = async (address, token, date) => {
    setLoadingStep("Fetching token balance at date...");
    setError(null);
    try {
      const data = await getTokenBalanceAtDate(address, token, date);
      setTokenBalance(data.balance);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch token balance");
      console.error("Error fetching token balance:", err);
      throw err;
    }
  };

  // Fetch current balance (alias for compatibility)
  const fetchCurrentBalance = async (address) => {
    setLoadingStep("Fetching current balance...");
    setError(null);
    try {
      const balance = await getCurrentBalance(address);
      setEthBalance(balance);
      return balance;
    } catch (err) {
      setError(err.message || "Failed to fetch current balance");
      console.error("Error fetching current balance:", err);
      throw err;
    }
  };

  // ===== NEW ETHERSCAN API ENDPOINTS =====

  // Fetch internal transactions
  const fetchInternalTransactions = async (address, fromBlock = null) => {
    setLoadingStep("Fetching internal transactions...");
    setError(null);
    try {
      const data = await getInternalTransactions(address, fromBlock);
      setInternalTransactions(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch internal transactions");
      console.error("Error fetching internal transactions:", err);
      throw err;
    }
  };

  // Fetch NFT transactions
  const fetchNFTTransactions = async (address, contractAddress = null, fromBlock = null) => {
    setLoadingStep("Fetching NFT transactions...");
    setError(null);
    try {
      const data = await getNFTTransactions(address, contractAddress, fromBlock);
      setNFTTransactions(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch NFT transactions");
      console.error("Error fetching NFT transactions:", err);
      throw err;
    }
  };

  // Fetch ERC1155 transactions
  const fetchERC1155Transactions = async (address, contractAddress = null, fromBlock = null) => {
    setLoadingStep("Fetching ERC1155 transactions...");
    setError(null);
    try {
      const data = await getERC1155Transactions(address, contractAddress, fromBlock);
      setERC1155Transactions(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch ERC1155 transactions");
      console.error("Error fetching ERC1155 transactions:", err);
      throw err;
    }
  };

  // Fetch multiple balances
  const fetchMultipleBalances = async (addresses) => {
    setLoadingStep("Fetching multiple balances...");
    setError(null);
    try {
      const data = await getMultipleBalances(addresses);
      setMultipleBalances(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch multiple balances");
      console.error("Error fetching multiple balances:", err);
      throw err;
    }
  };

  // Fetch address funding information
  const fetchAddressFundedBy = async (address) => {
    setLoadingStep("Fetching address funding information...");
    setError(null);
    try {
      const data = await getAddressFundedBy(address);
      setAddressFundingInfo(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch address funding information");
      console.error("Error fetching address funding information:", err);
      throw err;
    }
  };

  // Fetch mined blocks
  const fetchMinedBlocks = async (address, blocktype = "blocks") => {
    setLoadingStep("Fetching mined blocks...");
    setError(null);
    try {
      const data = await getMinedBlocks(address, blocktype);
      setMinedBlocks(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch mined blocks");
      console.error("Error fetching mined blocks:", err);
      throw err;
    }
  };

  // Fetch beacon chain withdrawals
  const fetchBeaconWithdrawals = async (address, fromBlock = null) => {
    setLoadingStep("Fetching beacon chain withdrawals...");
    setError(null);
    try {
      const data = await getBeaconWithdrawals(address, fromBlock);
      setBeaconWithdrawals(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch beacon withdrawals");
      console.error("Error fetching beacon withdrawals:", err);
      throw err;
    }
  };

  // ===== COMPREHENSIVE WALLET DATA FETCHING =====

  // Fetch all recent wallet data (default: last 24 hours)
  const fetchWalletData = async (address, fromBlock = null) => {
    setLoading(true);
    setError(null);
    setCurrentWallet(address);
    setLoadingStep("Initializing wallet analysis...");

    try {
      let ethTxs = [];
      let tokenTxs = [];
      let allTxs = [];
      let currentBalance = null;

      // Step 1: Fetch current balance
      setLoadingStep("Fetching current ETH balance...");
      await new Promise((resolve) => setTimeout(resolve, 300)); // Small delay for UX
      try {
        currentBalance = await getCurrentBalance(address);
        setEthBalance(currentBalance);
      } catch (err) {
        console.warn("Failed to fetch current balance:", err.message);
      }

      // Step 2: Fetch all transactions efficiently using backend endpoint
      setLoadingStep("Analyzing transaction history...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      try {
        const allTxs = await getAllTransactions(address, fromBlock);

        // Separate ETH and token transactions
        ethTxs = allTxs.filter((tx) => !tx.tokenSymbol);
        tokenTxs = allTxs.filter((tx) => tx.tokenSymbol);

        setTransactions(ethTxs);
        setTokenTransactions(tokenTxs);
        setAllTransactions(allTxs);
      } catch (err) {
        console.warn("Failed to fetch transactions:", err.message);
      }

      // Step 3: Get comprehensive analytics from backend
      setLoadingStep("Processing wallet analytics...");
      await new Promise((resolve) => setTimeout(resolve, 300));
      try {
        const analytics = await getWalletAnalytics(address);
        setWalletAnalytics(analytics);
        setWalletStats(
          analytics.overview || {
            totalBalance: parseFloat(currentBalance || 0),
            portfolioValue: 0,
            activeTransactions: 0,
            connectedDApps: 0,
          }
        );
      } catch (err) {
        console.warn("Failed to fetch analytics:", err.message);
        // Fallback to basic stats
        const basicStats = {
          totalBalance: parseFloat(currentBalance || 0),
          portfolioValue: parseFloat(currentBalance || 0) * 3000, // Mock ETH price
          activeTransactions: ethTxs.length + tokenTxs.length,
          connectedDApps: new Set(tokenTxs.map((tx) => tx.tokenSymbol).filter(Boolean)).size,
        };
        setWalletStats(basicStats);
      }

      setLoadingStep("Analysis complete!");
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        ethTransactions: ethTxs,
        tokenTransactions: tokenTxs,
        allTransactions: allTxs,
        balance: currentBalance,
        analytics: walletAnalytics,
      };
    } catch (err) {
      setError(err.message || "Failed to fetch wallet data");
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Fetch comprehensive wallet data including new Etherscan endpoints
  const fetchComprehensiveWalletData = async (address, fromBlock = null) => {
    setLoading(true);
    setError(null);
    setCurrentWallet(address);
    setLoadingStep("Fetching comprehensive wallet data...");

    try {
      const results = await Promise.allSettled([
        // Basic data
        getAllTransactions(address, fromBlock),
        getCurrentBalance(address),

        // Extended Etherscan data
        getInternalTransactions(address, fromBlock),
        getNFTTransactions(address, null, fromBlock),
        getERC1155Transactions(address, null, fromBlock),
        getBeaconWithdrawals(address, fromBlock),
        getAddressFundedBy(address),
        getMinedBlocks(address, "blocks"),

        // Analytics
        getWalletAnalytics(address),
      ]);

      // Process results
      const [allTxsResult, balanceResult, internalTxsResult, nftTxsResult, erc1155TxsResult, beaconResult, fundingResult, minedResult, analyticsResult] = results;

      // Handle successful results
      if (allTxsResult.status === "fulfilled") {
        const allTxs = allTxsResult.value;
        const ethTxs = allTxs.filter((tx) => !tx.tokenSymbol);
        const tokenTxs = allTxs.filter((tx) => tx.tokenSymbol);

        setTransactions(ethTxs);
        setTokenTransactions(tokenTxs);
        setAllTransactions(allTxs);
      }

      if (balanceResult.status === "fulfilled") {
        setEthBalance(balanceResult.value);
      }

      if (internalTxsResult.status === "fulfilled") {
        setInternalTransactions(internalTxsResult.value);
      }

      if (nftTxsResult.status === "fulfilled") {
        setNFTTransactions(nftTxsResult.value);
      }

      if (erc1155TxsResult.status === "fulfilled") {
        setERC1155Transactions(erc1155TxsResult.value);
      }

      if (beaconResult.status === "fulfilled") {
        setBeaconWithdrawals(beaconResult.value);
      }

      if (fundingResult.status === "fulfilled") {
        setAddressFundingInfo(fundingResult.value);
      }

      if (minedResult.status === "fulfilled") {
        setMinedBlocks(minedResult.value);
      }

      if (analyticsResult.status === "fulfilled") {
        setWalletAnalytics(analyticsResult.value);
        setWalletStats(
          analyticsResult.value.overview || {
            totalBalance: parseFloat(balanceResult.value || 0),
            portfolioValue: 0,
            activeTransactions: 0,
            connectedDApps: 0,
          }
        );
      }

      return {
        success: true,
        data: {
          transactions: allTxsResult.status === "fulfilled" ? allTxsResult.value : [],
          balance: balanceResult.status === "fulfilled" ? balanceResult.value : null,
          internalTransactions: internalTxsResult.status === "fulfilled" ? internalTxsResult.value : [],
          nftTransactions: nftTxsResult.status === "fulfilled" ? nftTxsResult.value : [],
          erc1155Transactions: erc1155TxsResult.status === "fulfilled" ? erc1155TxsResult.value : [],
          beaconWithdrawals: beaconResult.status === "fulfilled" ? beaconResult.value : [],
          fundingInfo: fundingResult.status === "fulfilled" ? fundingResult.value : null,
          minedBlocks: minedResult.status === "fulfilled" ? minedResult.value : [],
          analytics: analyticsResult.status === "fulfilled" ? analyticsResult.value : null,
        },
      };
    } catch (err) {
      setError(err.message || "Failed to fetch comprehensive wallet data");
      console.error("Error fetching comprehensive wallet data:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // Fetch extended wallet history (for users who need more than 24h)
  const fetchExtendedWalletData = async (address, daysBack = 7) => {
    setLoading(true);
    setError(null);
    setCurrentWallet(address);
    setLoadingStep("Fetching extended history...");

    try {
      if (daysBack > 30) {
        throw new Error("Maximum 30 days of history allowed");
      }

      // Fetch extended transaction history
      const [ethTxs, tokenTxs, currentBalance] = await Promise.all([getExtendedTransactions(address, daysBack), getExtendedTokenTransactions(address, daysBack), getCurrentBalance(address)]);

      // Combine and sort transactions
      const combined = [...ethTxs, ...tokenTxs].sort((a, b) => b.blockNumber - a.blockNumber);

      setTransactions(ethTxs);
      setTokenTransactions(tokenTxs);
      setAllTransactions(combined);
      setEthBalance(currentBalance);

      // Get analytics
      try {
        const analytics = await getWalletAnalytics(address);
        setWalletAnalytics(analytics);
        setWalletStats(analytics.overview);
      } catch (err) {
        console.warn("Failed to fetch analytics:", err.message);
      }

      return {
        ethTransactions: ethTxs,
        tokenTransactions: tokenTxs,
        allTransactions: combined,
        balance: currentBalance,
        analytics: walletAnalytics,
      };
    } catch (err) {
      setError(err.message || "Failed to fetch extended wallet data");
      console.error("Error fetching extended wallet data:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ===== FILTERING FUNCTIONS =====

  const fetchTransactionsByDateRange = async (address, startDate, endDate, type = "all") => {
    setLoading(true);
    setLoadingStep("Filtering transactions by date range...");
    setError(null);

    try {
      const data = await getTransactionsByDateRange(address, startDate, endDate, type);
      return data;
    } catch (err) {
      setError(err.message || "Failed to filter transactions by date");
      console.error("Error filtering by date range:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const fetchTransactionsByToken = async (address, tokenSymbol, fromBlock = null) => {
    setLoading(true);
    setLoadingStep(`Filtering ${tokenSymbol} transactions...`);
    setError(null);

    try {
      const data = await getTransactionsByToken(address, tokenSymbol, fromBlock);
      return data;
    } catch (err) {
      setError(err.message || "Failed to filter token transactions");
      console.error("Error filtering by token:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const fetchTransactionsByType = async (address, transactionType, fromBlock = null) => {
    setLoading(true);
    setLoadingStep(`Filtering ${transactionType} transactions...`);
    setError(null);

    try {
      const data = await getTransactionsByType(address, transactionType, fromBlock);
      return data;
    } catch (err) {
      setError(err.message || "Failed to filter by transaction type");
      console.error("Error filtering by type:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const fetchTransactionsByBlockRange = async (address, fromBlock, toBlock, type = "all") => {
    setLoading(true);
    setLoadingStep("Filtering transactions by block range...");
    setError(null);

    try {
      const data = await getTransactionsByBlockRange(address, fromBlock, toBlock, type);
      return data;
    } catch (err) {
      setError(err.message || "Failed to filter by block range");
      console.error("Error filtering by block range:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const fetchTransactionsByAmountRange = async (address, minAmount, maxAmount, tokenSymbol = "all") => {
    setLoading(true);
    setLoadingStep("Filtering transactions by amount range...");
    setError(null);

    try {
      const data = await getTransactionsByAmountRange(address, minAmount, maxAmount, tokenSymbol);
      return data;
    } catch (err) {
      setError(err.message || "Failed to filter by amount range");
      console.error("Error filtering by amount range:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ===== ANALYTICS FUNCTIONS =====

  const fetchWalletAnalytics = async (address) => {
    setLoading(true);
    setLoadingStep("Fetching wallet analytics...");
    setError(null);

    try {
      const analytics = await getWalletAnalytics(address);
      setWalletAnalytics(analytics);
      return analytics;
    } catch (err) {
      setError(err.message || "Failed to fetch wallet analytics");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const fetchTransactionPatterns = async (address, timeframe = "30d") => {
    setLoading(true);
    setLoadingStep("Analyzing transaction patterns...");
    setError(null);

    try {
      const patterns = await getTransactionPatterns(address, timeframe);
      return patterns;
    } catch (err) {
      setError(err.message || "Failed to fetch transaction patterns");
      console.error("Error fetching patterns:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const fetchActivityTimeline = async (address, period = "daily", duration = "30d") => {
    setLoading(true);
    setLoadingStep("Fetching activity timeline...");
    setError(null);

    try {
      const timeline = await getActivityTimeline(address, period, duration);
      return timeline;
    } catch (err) {
      setError(err.message || "Failed to fetch activity timeline");
      console.error("Error fetching timeline:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ===== ADVANCED SEARCH =====

  const fetchTransactionsAdvanced = async (filters) => {
    setLoading(true);
    setLoadingStep("Performing advanced search...");
    setError(null);

    try {
      const data = await getTransactionsAdvanced(filters);
      return data;
    } catch (err) {
      setError(err.message || "Failed to perform advanced search");
      console.error("Error in advanced search:", err);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ===== UTILITY FUNCTIONS =====

  const validateWalletAddress = async (address) => {
    try {
      const validation = await validateAddress(address);
      return validation;
    } catch (err) {
      console.error("Error validating address:", err);
      return { isValid: false, checksumAddress: null };
    }
  };

  const fetchNetworkStatus = async () => {
    try {
      const status = await getNetworkStatus();
      setNetworkStatus(status);
      return status;
    } catch (err) {
      console.error("Error fetching network status:", err);
    }
  };

  // ===== EXPORT FUNCTIONS =====

  const exportToCSV = async (address, filters = {}) => {
    setLoading(true);
    setLoadingStep("Exporting to CSV...");
    setError(null);

    try {
      const csvData = await exportTransactionsCSV(address, filters);

      // Create download link
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions_${address.slice(0, 8)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      setError(err.message || "Failed to export CSV");
      console.error("Error exporting CSV:", err);
      return false;
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const exportToJSON = async (address, filters = {}) => {
    setLoading(true);
    setLoadingStep("Exporting to JSON...");
    setError(null);

    try {
      const jsonData = await exportTransactionsJSON(address, filters);

      // Create download link
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions_${address.slice(0, 8)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      setError(err.message || "Failed to export JSON");
      console.error("Error exporting JSON:", err);
      return false;
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ===== REAL-TIME UPDATES =====

  const [updateSubscription, setUpdateSubscription] = useState(null);

  const subscribeToUpdates = (address, callback) => {
    if (updateSubscription) {
      updateSubscription(); // Clean up existing subscription
    }

    const cleanup = subscribeToWalletUpdates(address, callback);
    setUpdateSubscription(() => cleanup);

    return cleanup;
  };

  const unsubscribeFromUpdates = () => {
    if (updateSubscription) {
      updateSubscription();
      setUpdateSubscription(null);
    }
  };

  // ===== HELPER FUNCTIONS =====

  const formatTransactions = (transactions) => {
    return formatTransactionData(transactions);
  };

  const getTransactionSummary = (transactions) => {
    return calculateTransactionSummary(transactions);
  };

  const clearError = () => setError(null);

  const clearData = () => {
    setTransactions([]);
    setTokenTransactions([]);
    setAllTransactions([]);
    setInternalTransactions([]);
    setNFTTransactions([]);
    setERC1155Transactions([]);
    setBeaconWithdrawals([]);
    setMultipleBalances([]);
    setAddressFundingInfo(null);
    setMinedBlocks([]);
    setEthBalance(null);
    setTokenBalance(null);
    setWalletStats({
      totalBalance: 0,
      portfolioValue: 0,
      activeTransactions: 0,
      connectedDApps: 0,
    });
    setWalletAnalytics(null);
    setCurrentWallet("");
    setLoadingStep("");
    setNetworkStatus(null);
    unsubscribeFromUpdates();
  };

  const refreshWalletData = async () => {
    if (currentWallet) {
      await fetchWalletData(currentWallet);
    }
  };

  const refreshComprehensiveData = async () => {
    if (currentWallet) {
      await fetchComprehensiveWalletData(currentWallet);
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        // ===== STATE =====
        transactions,
        ethBalance,
        tokenTransactions,
        tokenBalance,
        allTransactions,
        internalTransactions,
        nftTransactions,
        erc1155Transactions,
        beaconWithdrawals,
        multipleBalances,
        addressFundingInfo,
        minedBlocks,
        walletStats,
        walletAnalytics,
        currentWallet,
        loading,
        error,
        loadingStep,
        networkStatus,

        // ===== BASIC FETCH FUNCTIONS =====
        fetchTransactions,
        fetchBalance,
        fetchBalanceAtDate,
        fetchTokenTransactions,
        fetchTokenBalanceAtDate,
        fetchCurrentBalance,
        fetchWalletData,
        fetchExtendedWalletData,
        fetchComprehensiveWalletData,

        // ===== NEW ETHERSCAN ENDPOINTS =====
        fetchInternalTransactions,
        fetchNFTTransactions,
        fetchERC1155Transactions,
        fetchMultipleBalances,
        fetchAddressFundedBy,
        fetchMinedBlocks,
        fetchBeaconWithdrawals,

        // ===== FILTERING FUNCTIONS =====
        fetchTransactionsByDateRange,
        fetchTransactionsByToken,
        fetchTransactionsByType,
        fetchTransactionsByBlockRange,
        fetchTransactionsByAmountRange,

        // ===== ANALYTICS FUNCTIONS =====
        fetchWalletAnalytics,
        fetchTransactionPatterns,
        fetchActivityTimeline,

        // ===== ADVANCED SEARCH =====
        fetchTransactionsAdvanced,

        // ===== UTILITY FUNCTIONS =====
        validateWalletAddress,
        fetchNetworkStatus,

        // ===== EXPORT FUNCTIONS =====
        exportToCSV,
        exportToJSON,

        // ===== REAL-TIME UPDATES =====
        subscribeToUpdates,
        unsubscribeFromUpdates,

        // ===== HELPER FUNCTIONS =====
        formatTransactions,
        getTransactionSummary,

        // ===== CONTROL FUNCTIONS =====
        clearError,
        clearData,
        refreshWalletData,
        refreshComprehensiveData,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

// Hook for consuming context
export { BlockchainProvider, BlockchainContext };
