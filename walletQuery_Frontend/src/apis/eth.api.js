// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 120000, // 2 minute timeout for blockchain queries
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.data || error.message);

    // Enhanced error messages
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout - blockchain network may be slow");
    } else if (error.response?.status === 429) {
      throw new Error("Rate limit exceeded - please wait before making another request");
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || "Invalid request parameters");
    } else if (error.response?.status === 404) {
      throw new Error("Endpoint not found - please check your API configuration");
    } else if (error.response?.status >= 500) {
      throw new Error("Server error - please try again later");
    }

    return Promise.reject(error);
  }
);

// ===== BASIC ENDPOINTS =====

// ETH transactions (defaults to last 24 hours if no fromBlock specified)
export const getTransactions = async (address, fromBlock = null) => {
  const params = { address };
  if (fromBlock !== null) {
    params.fromBlock = fromBlock;
  }
  const res = await api.get(`/transactions`, { params });
  return res.data;
};

// Current ETH balance
export const getBalance = async (address) => {
  const res = await api.get(`/balance`, { params: { address } });
  return res.data;
};

// ETH balance at date
export const getBalanceAtDate = async (address, date) => {
  const res = await api.get(`/balanceAtDate`, { params: { address, date } });
  return res.data;
};

// Token transactions (defaults to last 24 hours if no fromBlock specified)
export const getTokenTransactions = async (address, fromBlock = null) => {
  const params = { address };
  if (fromBlock !== null) {
    params.fromBlock = fromBlock;
  }
  const res = await api.get(`/token-transactions`, { params });
  return res.data;
};

// Token balance at date
export const getTokenBalanceAtDate = async (address, token, date) => {
  const res = await api.get(`/token-balanceAtDate`, {
    params: { address, token, date },
  });
  return res.data;
};

// Get current ETH balance (alias for compatibility)
export const getCurrentBalance = async (address) => {
  const res = await getBalance(address);
  return res.balance;
};

// Get all transactions (both ETH and token) - defaults to last 24 hours
export const getAllTransactions = async (address, fromBlock = null) => {
  const params = { address };
  if (fromBlock !== null) {
    params.fromBlock = fromBlock;
  }
  const res = await api.get(`/all-transactions`, { params });
  return res.data;
};

// ===== NEW ETHERSCAN API ENDPOINTS =====

// Get internal transactions
export const getInternalTransactions = async (address, fromBlock = null) => {
  const params = { address };
  if (fromBlock !== null) {
    params.fromBlock = fromBlock;
  }
  const res = await api.get(`/internal-transactions`, { params });
  return res.data;
};

// Get NFT transactions
export const getNFTTransactions = async (address, contractAddress = null, fromBlock = null) => {
  const params = { address };
  if (contractAddress) {
    params.contractAddress = contractAddress;
  }
  if (fromBlock !== null) {
    params.fromBlock = fromBlock;
  }
  const res = await api.get(`/nft-transactions`, { params });
  return res.data;
};

// Get ERC1155 transactions
export const getERC1155Transactions = async (address, contractAddress = null, fromBlock = null) => {
  const params = { address };
  if (contractAddress) {
    params.contractAddress = contractAddress;
  }
  if (fromBlock !== null) {
    params.fromBlock = fromBlock;
  }
  const res = await api.get(`/erc1155-transactions`, { params });
  return res.data;
};

// Get multiple balances
export const getMultipleBalances = async (addresses) => {
  if (Array.isArray(addresses)) {
    addresses = addresses.join(",");
  }
  const res = await api.get(`/multiple-balances`, {
    params: { addresses },
  });
  return res.data;
};

// Get address funding information
export const getAddressFundedBy = async (address) => {
  const res = await api.get(`/address-funded-by`, { params: { address } });
  return res.data;
};

// Get mined blocks
export const getMinedBlocks = async (address, blocktype = "blocks") => {
  const res = await api.get(`/mined-blocks`, {
    params: { address, blocktype },
  });
  return res.data;
};

// Get beacon chain withdrawals
export const getBeaconWithdrawals = async (address, fromBlock = null) => {
  const params = { address };
  if (fromBlock !== null) {
    params.fromBlock = fromBlock;
  }
  const res = await api.get(`/beacon-withdrawals`, { params });
  return res.data;
};

// ===== EXTENDED HISTORY FUNCTIONS =====

export const getExtendedTransactions = async (address, daysBack = 7) => {
  if (daysBack > 30) {
    throw new Error("Maximum 30 days of history allowed");
  }
  const res = await api.get(`/transactions/extended`, { params: { address, daysBack } });
  return res.data;
};

export const getExtendedTokenTransactions = async (address, daysBack = 7) => {
  if (daysBack > 30) {
    throw new Error("Maximum 30 days of history allowed");
  }
  const res = await api.get(`/token-transactions/extended`, { params: { address, daysBack } });
  return res.data;
};

// Get all extended transactions
export const getAllExtendedTransactions = async (address, daysBack = 7) => {
  const [ethTxs, tokenTxs] = await Promise.all([getExtendedTransactions(address, daysBack), getExtendedTokenTransactions(address, daysBack)]);

  const allTxs = [...ethTxs, ...tokenTxs].sort((a, b) => b.blockNumber - a.blockNumber);
  return allTxs;
};

// ===== FILTERING ENDPOINTS =====

// Get transactions by date range
export const getTransactionsByDateRange = async (address, startDate, endDate, type = "all") => {
  const res = await api.get("/transactions/date-range", {
    params: { address, startDate, endDate, type },
  });
  return res.data;
};

// Get transactions by block range
export const getTransactionsByBlockRange = async (address, fromBlock, toBlock, type = "all") => {
  const res = await api.get("/transactions/block-range", {
    params: { address, fromBlock, toBlock, type },
  });
  return res.data;
};

// Get transactions by token
export const getTransactionsByToken = async (address, tokenSymbol, fromBlock = null) => {
  const params = { address, tokenSymbol };
  if (fromBlock !== null) {
    params.fromBlock = fromBlock;
  }
  const res = await api.get("/transactions/token", { params });
  return res.data;
};

// Get transactions by type (send/receive/swap)
export const getTransactionsByType = async (address, transactionType, fromBlock = null) => {
  const params = { address, type: transactionType };
  if (fromBlock !== null) {
    params.fromBlock = fromBlock;
  }
  const res = await api.get("/transactions/type", { params });
  return res.data;
};

// Get transactions by amount range
export const getTransactionsByAmountRange = async (address, minAmount, maxAmount, tokenSymbol = "all") => {
  const res = await api.get("/transactions/amount-range", {
    params: { address, minAmount, maxAmount, tokenSymbol },
  });
  return res.data;
};

// ===== ANALYTICS ENDPOINTS =====

// Get wallet analytics summary
export const getWalletAnalytics = async (address) => {
  const res = await api.get("/analytics/wallet", {
    params: { address },
  });
  return res.data;
};

// Get transaction patterns
export const getTransactionPatterns = async (address, timeframe = "30d") => {
  const res = await api.get("/analytics/patterns", {
    params: { address, timeframe },
  });
  return res.data;
};

// Get activity timeline
export const getActivityTimeline = async (address, period = "daily", duration = "30d") => {
  const res = await api.get("/analytics/activity-timeline", {
    params: { address, period, duration },
  });
  return res.data;
};

// ===== ADVANCED FILTERING =====

// Advanced multi-parameter search
export const getTransactionsAdvanced = async (filters) => {
  const { address, startDate, endDate, fromBlock, toBlock, transactionType, tokenSymbol, minAmount, maxAmount, limit = 100, offset = 0, sortBy = "blockNumber", sortOrder = "desc" } = filters;

  const res = await api.get("/transactions/advanced", {
    params: {
      address,
      startDate,
      endDate,
      fromBlock,
      toBlock,
      transactionType,
      tokenSymbol,
      minAmount,
      maxAmount,
      limit,
      offset,
      sortBy,
      sortOrder,
    },
  });
  return res.data;
};

// ===== UTILITY ENDPOINTS =====

// Validate Ethereum address
export const validateAddress = async (address) => {
  const res = await api.get("/utils/validate-address", {
    params: { address },
  });
  return res.data;
};

// Get network status
export const getNetworkStatus = async () => {
  const res = await api.get("/utils/network-status");
  return res.data;
};

// ===== EXPORT FUNCTIONS =====

// Export transactions to CSV
export const exportTransactionsCSV = async (address, filters = {}) => {
  const res = await api.get("/export/csv", {
    params: { address, ...filters },
    responseType: "blob",
  });
  return res.data;
};

// Export transactions to JSON
export const exportTransactionsJSON = async (address, filters = {}) => {
  const res = await api.get("/export/json", {
    params: { address, ...filters },
  });
  return res.data;
};

// ===== REAL-TIME ENDPOINTS =====

// Get latest transactions (for real-time updates)
export const getLatestTransactions = async (address, since) => {
  // Use the advanced search with timestamp filtering
  const filters = {
    address,
    startDate: new Date(since).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    limit: 50,
    sortBy: "blockNumber",
    sortOrder: "desc",
  };
  const result = await getTransactionsAdvanced(filters);
  return result.transactions || [];
};

// Subscribe to wallet updates (WebSocket endpoint reference)
export const subscribeToWalletUpdates = (address, callback) => {
  // This would typically use WebSocket
  // For now, we'll use polling as a fallback
  const interval = setInterval(async () => {
    try {
      const latest = await getLatestTransactions(address, Date.now() - 60000); // Last minute
      if (latest.length > 0) {
        callback(latest);
      }
    } catch (error) {
      console.error("Error polling for updates:", error);
    }
  }, 30000); // Poll every 30 seconds

  // Return cleanup function
  return () => clearInterval(interval);
};

// ===== HELPER FUNCTIONS =====

// Format transaction data for frontend
export const formatTransactionData = (transactions) => {
  return transactions.map((tx) => ({
    ...tx,
    formattedValue: tx.value ? parseFloat(tx.value).toFixed(6) : "0",
    formattedTimestamp: new Date(tx.timestamp * 1000).toISOString(),
    ageInDays: Math.floor((Date.now() - tx.timestamp * 1000) / (1000 * 60 * 60 * 24)),
  }));
};

// Calculate transaction summary
export const calculateTransactionSummary = (transactions) => {
  return {
    total: transactions.length,
    sent: transactions.filter((tx) => tx.type === "send").length,
    received: transactions.filter((tx) => tx.type === "receive").length,
    swaps: transactions.filter((tx) => tx.type === "swap").length,
    totalValue: transactions.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0),
    avgValue: transactions.length > 0 ? transactions.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0) / transactions.length : 0,
    uniqueTokens: new Set(transactions.map((tx) => tx.tokenSymbol).filter(Boolean)).size,
  };
};

export default api;
