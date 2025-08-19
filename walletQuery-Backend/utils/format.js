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
    value: ethers.formatEther(tx.value || "0"), // convert wei → ETH
    blockNumber: tx.blockNumber,
    timestamp: timestamp || null,
    gasUsed: tx.gasLimit ? tx.gasLimit.toString() : null,
    gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, "gwei") : null,
  };
}

/**
 * Format ETH balance for API response
 */
export function formatBalance(balanceWei) {
  return {
    balance: ethers.formatEther(balanceWei || "0"), // string in ETH
    balanceWei: balanceWei.toString(),
    unit: "ETH",
  };
}

/**
 * Format a token transfer log
 */
export function formatTokenTransaction(log, tokenSymbol = "ERC20", timestamp = null, decimals = 18) {
  return {
    hash: log.transactionHash || `${log.address}-${log.blockNumber}`, // fallback hash
    token: log.address, // token contract address
    symbol: tokenSymbol,
    from: log.from,
    to: log.to,
    value: ethers.formatUnits(log.value || "0", decimals), // convert with decimals
    valueRaw: log.value.toString(),
    blockNumber: log.blockNumber,
    timestamp: timestamp || null,
  };
}

/**
 * Format token balance for API response
 */
export function formatTokenBalance(balanceRaw, symbol = "ERC20", decimals = 18) {
  return {
    balance: ethers.formatUnits(balanceRaw || "0", decimals),
    balanceRaw: balanceRaw.toString(),
    unit: symbol,
    decimals: decimals,
  };
}
