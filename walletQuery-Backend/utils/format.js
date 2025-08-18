// src/utils/format.js
import { ethers } from "ethers";

/**
 * Format a raw ETH transaction into clean JSON
 */
export function formatEthTransaction(tx, timestamp = null) {
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: ethers.formatEther(tx.value), // convert wei → ETH
    blockNumber: tx.blockNumber,
    timestamp: timestamp || null,
  };
}

/**
 * Format ETH balance for API response
 */
export function formatBalance(balanceWei) {
  return {
    balance: ethers.formatEther(balanceWei), // string in ETH
    unit: "ETH",
  };
}

/**
 * Format a token transfer log
 */
export function formatTokenTransaction(log, tokenSymbol = "ERC20", timestamp = null, decimals = 18) {
  return {
    token: log.address, // token contract address
    symbol: tokenSymbol,
    from: log.from,
    to: log.to,
    value: ethers.formatUnits(log.value, decimals), // convert with decimals
    blockNumber: log.blockNumber,
    timestamp: timestamp || null,
  };
}

/**
 * Format token balance for API response
 */
export function formatTokenBalance(balanceRaw, symbol = "ERC20", decimals = 18) {
  return {
    balance: ethers.formatUnits(balanceRaw, decimals),
    unit: symbol,
  };
}
