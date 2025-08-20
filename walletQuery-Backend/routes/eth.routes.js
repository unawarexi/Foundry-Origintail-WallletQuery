// src/routes/transactions.js
import express from "express";
import {
  // Basic endpoints
  getTransactions,
  getBalanceAtDate,
  getTokenTransactions,
  getTokenBalanceAtDate,
  getBalance,

  // Extended history endpoints
  getExtendedTransactions,
  getExtendedTokenTransactions,

  // All transactions
  getAllTransactions,

  // New Etherscan API endpoints
  getInternalTransactions,
  getNFTTransactions,
  getERC1155Transactions,
  getMultipleBalances,
  getAddressFundedBy,
  getMinedBlocks,
  getBeaconWithdrawals,

  // Filter endpoints
  getTransactionsByDateRange,
  getTransactionsByBlockRange,
  getTransactionsByToken,
  getTransactionsByType,
  getTransactionsByAmountRange,

  // Analytics endpoints
  getWalletAnalytics,
  getTransactionPatterns,
  getActivityTimeline,

  // Advanced search
  getTransactionsAdvanced,

  // Utility endpoints
  validateAddress,
  getNetworkStatus,

  // Export endpoints
  exportTransactionsCSV,
  exportTransactionsJSON,
} from "../controllers/eth.controller.js";

const router = express.Router();

// ===== BASIC ENDPOINTS =====
router.get("/transactions", getTransactions);
router.get("/balance", getBalance);
router.get("/balanceAtDate", getBalanceAtDate);
router.get("/token-transactions", getTokenTransactions);
router.get("/token-balanceAtDate", getTokenBalanceAtDate);

// ===== EXTENDED HISTORY ENDPOINTS =====
router.get("/transactions/extended", getExtendedTransactions);
router.get("/token-transactions/extended", getExtendedTokenTransactions);

// ===== ALL TRANSACTIONS =====
router.get("/all-transactions", getAllTransactions);

// ===== NEW ETHERSCAN API ENDPOINTS =====
router.get("/internal-transactions", getInternalTransactions);
router.get("/nft-transactions", getNFTTransactions);
router.get("/erc1155-transactions", getERC1155Transactions);
router.get("/multiple-balances", getMultipleBalances);
router.get("/address-funded-by", getAddressFundedBy);
router.get("/mined-blocks", getMinedBlocks);
router.get("/beacon-withdrawals", getBeaconWithdrawals);

// ===== FILTERING ENDPOINTS =====
router.get("/transactions/date-range", getTransactionsByDateRange);
router.get("/transactions/block-range", getTransactionsByBlockRange);
router.get("/transactions/token", getTransactionsByToken);
router.get("/transactions/type", getTransactionsByType);
router.get("/transactions/amount-range", getTransactionsByAmountRange);

// ===== ANALYTICS ENDPOINTS =====
router.get("/analytics/wallet", getWalletAnalytics);
router.get("/analytics/patterns", getTransactionPatterns);
router.get("/analytics/activity-timeline", getActivityTimeline);

// ===== ADVANCED SEARCH =====
router.get("/transactions/advanced", getTransactionsAdvanced);

// ===== UTILITY ENDPOINTS =====
router.get("/utils/validate-address", validateAddress);
router.get("/utils/network-status", getNetworkStatus);

// ===== EXPORT ENDPOINTS =====
router.get("/export/csv", exportTransactionsCSV);
router.get("/export/json", exportTransactionsJSON);

export default router;
