// Defines API endpoints like /transactions and /balanceAtDate.//
// src/routes/transactions.js
import express from "express";
import {
  getTransactions,
  getBalanceAtDate,
  getTokenTransactions,
  getTokenBalanceAtDate,
} from "../controllers/transactions.controller.js";

const router = express.Router();

// ETH transactions
router.get("/transactions", getTransactions);

// ETH balance at specific date
router.get("/balanceAtDate", getBalanceAtDate);

// Token (ERC20) transactions
router.get("/token-transactions", getTokenTransactions);

// Token balance at specific date
router.get("/token-balanceAtDate", getTokenBalanceAtDate);

export default router;
