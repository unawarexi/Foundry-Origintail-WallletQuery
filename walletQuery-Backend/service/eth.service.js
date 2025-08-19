// src/services/eth.service.js
import { ethers } from "ethers";
import provider, { makeEtherscanRequest, etherscanConfig } from "../config/ether.provider.js";
import { formatEthTransaction, formatTokenTransaction } from "../utils/format.js";

// ERC20 ABI (minimal for balance + Transfer events)
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)", "function symbol() view returns (string)", "event Transfer(address indexed from, address indexed to, uint256 value)"];

// Configuration
const MAX_BLOCKS_PER_REQUEST = 50;
const MAX_TRANSACTIONS_PER_REQUEST = 1000; // Etherscan default limit
const REQUEST_DELAY = 300;

/**
 * Add delay between requests
 */
async function delay(ms = REQUEST_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get ETH balance using Etherscan API
 */
async function getBalance(address) {
  try {
    const response = await makeEtherscanRequest({
      module: "account",
      action: "balance",
      address: address,
      tag: "latest",
    });

    return ethers.formatEther(response.result);
  } catch (error) {
    // Fallback to direct provider call
    console.warn("Etherscan balance request failed, using provider fallback");
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}

/**
 * Get multiple ETH balances using Etherscan API
 */
async function getMultipleBalances(addresses) {
  if (addresses.length > 20) {
    throw new Error("Maximum 20 addresses per call");
  }

  try {
    const response = await makeEtherscanRequest({
      module: "account",
      action: "balancemulti",
      address: addresses.join(","),
      tag: "latest",
    });

    return response.result.map((item) => ({
      address: item.account,
      balance: ethers.formatEther(item.balance),
    }));
  } catch (error) {
    console.warn("Etherscan multi-balance request failed");
    throw error;
  }
}

/**
 * Get normal transactions using Etherscan API
 */
async function getTransactions(address, fromBlock = null) {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  try {
    const latestBlock = await provider.getBlockNumber();
    const startBlock = fromBlock || Math.max(latestBlock - MAX_BLOCKS_PER_REQUEST, 0);

    const response = await makeEtherscanRequest({
      module: "account",
      action: "txlist",
      address: address,
      startblock: startBlock,
      endblock: latestBlock,
      page: 1,
      offset: MAX_TRANSACTIONS_PER_REQUEST,
      sort: "desc",
    });

    const transactions = response.result || [];

    return transactions.map((tx) => ({
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber),
      timestamp: parseInt(tx.timeStamp),
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      type: tx.from.toLowerCase() === address.toLowerCase() ? "send" : "receive",
      status: tx.txreceipt_status === "1" ? "success" : "failed",
    }));
  } catch (error) {
    console.warn("Etherscan transaction request failed, using limited provider fallback");
    // Fallback to original method with very limited scope
    return getTransactionsFallback(address, fromBlock);
  }
}

/**
 * Fallback method for transactions (heavily limited)
 */
async function getTransactionsFallback(address, fromBlock = null) {
  const latestBlock = await provider.getBlockNumber();
  const startBlock = fromBlock || Math.max(latestBlock - 5, 0); // Only 5 blocks

  const txs = [];

  for (let blockNum = startBlock; blockNum <= latestBlock; blockNum++) {
    try {
      const blockData = await provider.getBlock(blockNum, true);

      if (blockData?.transactions) {
        for (let tx of blockData.transactions) {
          if (tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()) {
            txs.push(formatEthTransaction(tx, blockData.timestamp));
          }
        }
      }

      await delay(100);
    } catch (error) {
      console.warn(`Failed to get block ${blockNum}:`, error.message);
    }
  }

  return txs;
}

/**
 * Get internal transactions using Etherscan API
 */
async function getInternalTransactions(address, fromBlock = null) {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  try {
    const latestBlock = await provider.getBlockNumber();
    const startBlock = fromBlock || Math.max(latestBlock - MAX_BLOCKS_PER_REQUEST, 0);

    const response = await makeEtherscanRequest({
      module: "account",
      action: "txlistinternal",
      address: address,
      startblock: startBlock,
      endblock: latestBlock,
      page: 1,
      offset: MAX_TRANSACTIONS_PER_REQUEST,
      sort: "desc",
    });

    const transactions = response.result || [];

    return transactions.map((tx) => ({
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber),
      timestamp: parseInt(tx.timeStamp),
      from: tx.from,
      to: tx.to,
      value: ethers.formatEther(tx.value),
      type: "internal",
      contractAddress: tx.contractAddress || null,
    }));
  } catch (error) {
    console.warn("Etherscan internal transaction request failed");
    return []; // Return empty array as internal txs are hard to get via provider
  }
}

/**
 * Get ERC20 token transactions using Etherscan API
 */
async function getTokenTransactions(address, contractAddress = null, fromBlock = null) {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  try {
    const latestBlock = await provider.getBlockNumber();
    const startBlock = fromBlock || Math.max(latestBlock - MAX_BLOCKS_PER_REQUEST, 0);

    const params = {
      module: "account",
      action: "tokentx",
      address: address,
      startblock: startBlock,
      endblock: latestBlock,
      page: 1,
      offset: MAX_TRANSACTIONS_PER_REQUEST,
      sort: "desc",
    };

    // Add contract address filter if specified
    if (contractAddress) {
      params.contractaddress = contractAddress;
    }

    const response = await makeEtherscanRequest(params);
    const transactions = response.result || [];

    return transactions.map((tx) => ({
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber),
      timestamp: parseInt(tx.timeStamp),
      from: tx.from,
      to: tx.to,
      value: ethers.formatUnits(tx.value, parseInt(tx.tokenDecimal || 18)),
      tokenSymbol: tx.tokenSymbol,
      tokenName: tx.tokenName,
      contractAddress: tx.contractAddress,
      type: tx.from.toLowerCase() === address.toLowerCase() ? "send" : "receive",
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
    }));
  } catch (error) {
    console.warn("Etherscan token transaction request failed, using limited provider fallback");
    return getTokenTransactionsFallback(address, fromBlock);
  }
}

/**
 * Get ERC721 (NFT) transactions using Etherscan API
 */
async function getNFTTransactions(address, contractAddress = null, fromBlock = null) {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  try {
    const latestBlock = await provider.getBlockNumber();
    const startBlock = fromBlock || Math.max(latestBlock - MAX_BLOCKS_PER_REQUEST, 0);

    const params = {
      module: "account",
      action: "tokennfttx",
      address: address,
      startblock: startBlock,
      endblock: latestBlock,
      page: 1,
      offset: MAX_TRANSACTIONS_PER_REQUEST,
      sort: "desc",
    };

    if (contractAddress) {
      params.contractaddress = contractAddress;
    }

    const response = await makeEtherscanRequest(params);
    const transactions = response.result || [];

    return transactions.map((tx) => ({
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber),
      timestamp: parseInt(tx.timeStamp),
      from: tx.from,
      to: tx.to,
      tokenID: tx.tokenID,
      tokenSymbol: tx.tokenSymbol,
      tokenName: tx.tokenName,
      contractAddress: tx.contractAddress,
      type: "nft_transfer",
    }));
  } catch (error) {
    console.warn("Etherscan NFT transaction request failed");
    return [];
  }
}

/**
 * Get ERC1155 transactions using Etherscan API
 */
async function getERC1155Transactions(address, contractAddress = null, fromBlock = null) {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  try {
    const latestBlock = await provider.getBlockNumber();
    const startBlock = fromBlock || Math.max(latestBlock - MAX_BLOCKS_PER_REQUEST, 0);

    const params = {
      module: "account",
      action: "token1155tx",
      address: address,
      startblock: startBlock,
      endblock: latestBlock,
      page: 1,
      offset: MAX_TRANSACTIONS_PER_REQUEST,
      sort: "desc",
    };

    if (contractAddress) {
      params.contractaddress = contractAddress;
    }

    const response = await makeEtherscanRequest(params);
    const transactions = response.result || [];

    return transactions.map((tx) => ({
      hash: tx.hash,
      blockNumber: parseInt(tx.blockNumber),
      timestamp: parseInt(tx.timeStamp),
      from: tx.from,
      to: tx.to,
      tokenID: tx.tokenID,
      tokenValue: tx.tokenValue,
      tokenSymbol: tx.tokenSymbol,
      tokenName: tx.tokenName,
      contractAddress: tx.contractAddress,
      type: "erc1155_transfer",
    }));
  } catch (error) {
    console.warn("Etherscan ERC1155 transaction request failed");
    return [];
  }
}

/**
 * Get historical balance at specific block using Etherscan API
 */
async function getBalanceAtDate(address, date) {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  const targetTime = new Date(`${date}T00:00:00Z`).getTime() / 1000;

  if (isNaN(targetTime)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD");
  }

  try {
    // First find the block number for the date
    const blockNumber = await findBlockByTimestamp(targetTime);

    // Use Etherscan's balance history API if available
    const response = await makeEtherscanRequest({
      module: "account",
      action: "balancehistory",
      address: address,
      blockno: blockNumber,
    });

    return ethers.formatEther(response.result);
  } catch (error) {
    // Fallback to provider method
    console.warn("Etherscan balance history request failed, using provider fallback");
    const blockNumber = await findBlockByTimestamp(targetTime);
    const balance = await provider.getBalance(address, blockNumber);
    return ethers.formatEther(balance);
  }
}

/**
 * Get address funding information using Etherscan API
 */
async function getAddressFundedBy(address) {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  try {
    const response = await makeEtherscanRequest({
      module: "account",
      action: "fundedby",
      address: address,
    });

    return {
      fundedBy: response.result?.fundedBy || null,
      age: response.result?.age || null,
    };
  } catch (error) {
    console.warn("Etherscan funded-by request failed");
    return { fundedBy: null, age: null };
  }
}

/**
 * Get blocks mined by address using Etherscan API
 */
async function getMinedBlocks(address, blocktype = "blocks") {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  try {
    const response = await makeEtherscanRequest({
      module: "account",
      action: "getminedblocks",
      address: address,
      blocktype: blocktype,
      page: 1,
      offset: 100,
    });

    return response.result || [];
  } catch (error) {
    console.warn("Etherscan mined blocks request failed");
    return [];
  }
}

/**
 * Get beacon chain withdrawals using Etherscan API
 */
async function getBeaconWithdrawals(address, fromBlock = null) {
  if (!ethers.isAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  try {
    const latestBlock = await provider.getBlockNumber();
    const startBlock = fromBlock || Math.max(latestBlock - MAX_BLOCKS_PER_REQUEST, 0);

    const response = await makeEtherscanRequest({
      module: "account",
      action: "txsBeaconWithdrawal",
      address: address,
      startblock: startBlock,
      endblock: latestBlock,
      page: 1,
      offset: 100,
      sort: "desc",
    });

    return response.result || [];
  } catch (error) {
    console.warn("Etherscan beacon withdrawals request failed");
    return [];
  }
}

/**
 * Fallback token transactions method
 */
async function getTokenTransactionsFallback(address, fromBlock = null) {
  // Very limited token transaction scanning using provider
  const latestBlock = await provider.getBlockNumber();
  const startBlock = fromBlock || Math.max(latestBlock - 5, 0); // Only 5 blocks

  try {
    const incomingLogs = await provider.getLogs({
      topics: [ethers.id("Transfer(address,address,uint256)"), null, ethers.zeroPadValue(address, 32)],
      fromBlock: startBlock,
      toBlock: latestBlock,
    });

    await delay(300);

    const outgoingLogs = await provider.getLogs({
      topics: [ethers.id("Transfer(address,address,uint256)"), ethers.zeroPadValue(address, 32), null],
      fromBlock: startBlock,
      toBlock: latestBlock,
    });

    const allLogs = [...incomingLogs, ...outgoingLogs];
    const transfers = [];

    for (const log of allLogs) {
      try {
        const parsed = new ethers.Interface(ERC20_ABI).parseLog(log);
        const block = await provider.getBlock(log.blockNumber);

        transfers.push({
          hash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: block.timestamp,
          from: parsed.args.from,
          to: parsed.args.to,
          value: ethers.formatEther(parsed.args.value),
          contractAddress: log.address,
          type: parsed.args.from.toLowerCase() === address.toLowerCase() ? "send" : "receive",
          tokenSymbol: "UNKNOWN",
        });

        await delay(100);
      } catch (error) {
        console.warn("Failed to parse log:", error.message);
      }
    }

    return transfers;
  } catch (error) {
    console.warn("Token transactions fallback failed:", error.message);
    return [];
  }
}

/**
 * Get all transactions (combining multiple Etherscan endpoints)
 */
async function getAllTransactions(address, fromBlock = null) {
  console.log("Getting all transactions using Etherscan API...");

  try {
    // Get different types of transactions with delays
    const ethTxs = await getTransactions(address, fromBlock);
    await delay(300);

    const internalTxs = await getInternalTransactions(address, fromBlock);
    await delay(300);

    const tokenTxs = await getTokenTransactions(address, null, fromBlock);
    await delay(300);

    // Combine all transactions
    const allTxs = [...ethTxs, ...internalTxs, ...tokenTxs].sort((a, b) => b.blockNumber - a.blockNumber);

    console.log(`Retrieved ${ethTxs.length} ETH, ${internalTxs.length} internal, and ${tokenTxs.length} token transactions`);
    return allTxs;
  } catch (error) {
    console.error("Error in getAllTransactions:", error);
    throw new Error(`Failed to get all transactions: ${error.message}`);
  }
}

/**
 * Enhanced wallet analytics using Etherscan data
 */
async function getWalletAnalytics(address) {
  console.log("Getting enhanced wallet analytics using Etherscan API...");

  try {
    // Get current balance
    const currentBalance = await getBalance(address);

    // Get recent transactions
    const allTxs = await getAllTransactions(address);

    // Get funding information
    const fundingInfo = await getAddressFundedBy(address);

    // Calculate analytics
    const ethTxs = allTxs.filter((tx) => !tx.tokenSymbol);
    const tokenTxs = allTxs.filter((tx) => tx.tokenSymbol);

    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const activity = {
      lastHour: allTxs.filter((tx) => new Date(tx.timestamp * 1000).getTime() > hourAgo).length,
      last24Hours: allTxs.filter((tx) => new Date(tx.timestamp * 1000).getTime() > dayAgo).length,
      lastWeek: allTxs.filter((tx) => new Date(tx.timestamp * 1000).getTime() > weekAgo).length,
    };

    // Token analysis
    const uniqueTokens = new Set(tokenTxs.map((tx) => tx.tokenSymbol).filter(Boolean));
    const tokenCounts = {};
    tokenTxs.forEach((tx) => {
      if (tx.tokenSymbol) {
        tokenCounts[tx.tokenSymbol] = (tokenCounts[tx.tokenSymbol] || 0) + 1;
      }
    });

    const mostActiveToken = Object.keys(tokenCounts).length > 0 ? Object.entries(tokenCounts).reduce((a, b) => (tokenCounts[a[0]] > tokenCounts[b[0]] ? a : b))[0] : null;

    // Transaction patterns
    const sentTxs = ethTxs.filter((tx) => tx.type === "send");
    const receivedTxs = ethTxs.filter((tx) => tx.type === "receive");
    const totalSent = sentTxs.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0);
    const totalReceived = receivedTxs.reduce((sum, tx) => sum + parseFloat(tx.value || 0), 0);

    const ethPrice = 3000; // Mock ETH price - you might want to get this from an API
    const portfolioValue = parseFloat(currentBalance) * ethPrice;

    return {
      overview: {
        totalTransactions: allTxs.length,
        ethTransactions: ethTxs.length,
        tokenTransactions: tokenTxs.length,
        internalTransactions: allTxs.filter((tx) => tx.type === "internal").length,
        currentBalance: parseFloat(currentBalance),
        portfolioValue,
        recentActivity: activity.lastHour,
        connectedTokens: uniqueTokens.size,
      },
      activity,
      tokens: {
        uniqueTokens: uniqueTokens.size,
        mostActiveToken,
        tokenDistribution: tokenCounts,
      },
      patterns: {
        ethSent: totalSent,
        ethReceived: totalReceived,
        netFlow: totalReceived - totalSent,
      },
      fundingInfo,
      metadata: {
        dataSource: "Etherscan API",
        scope: "Recent transactions with full history available",
      },
    };
  } catch (error) {
    console.error("Error in getWalletAnalytics:", error);
    throw new Error(`Failed to get wallet analytics: ${error.message}`);
  }
}

// Re-export existing methods that don't need changes but use enhanced capabilities
const getExtendedTransactions = (address, daysBack = 7) => {
  // Convert days to blocks (assuming ~12s block time)
  const blocksBack = Math.min(daysBack * 7200, MAX_BLOCKS_PER_REQUEST);
  return getTransactions(address, blocksBack);
};

const getExtendedTokenTransactions = (address, daysBack = 7) => {
  const blocksBack = Math.min(daysBack * 7200, MAX_BLOCKS_PER_REQUEST);
  return getTokenTransactions(address, null, blocksBack);
};

const getTransactionsByDateRange = async (address, startDate, endDate, type = "all") => {
  const allTxs = await getAllTransactions(address);
  const startTime = new Date(`${startDate}T00:00:00Z`).getTime() / 1000;
  const endTime = new Date(`${endDate}T23:59:59Z`).getTime() / 1000;

  return allTxs.filter((tx) => tx.timestamp >= startTime && tx.timestamp <= endTime && (type === "all" || (type === "eth" && !tx.tokenSymbol) || (type === "token" && tx.tokenSymbol)));
};

const getTransactionsByToken = async (address, tokenSymbol, fromBlock = null) => {
  if (tokenSymbol.toLowerCase() === "eth") {
    return getTransactions(address, fromBlock);
  }

  const tokenTxs = await getTokenTransactions(address, null, fromBlock);
  return tokenTxs.filter((tx) => tx.tokenSymbol?.toLowerCase() === tokenSymbol.toLowerCase());
};

// Binary search to find block by timestamp (unchanged but more efficient with caching)
async function findBlockByTimestamp(targetTime) {
  let low = 0;
  let high = await provider.getBlockNumber();
  let blockNumber = high;

  const maxIterations = 15;
  let iterations = 0;

  while (low <= high && iterations < maxIterations) {
    const mid = Math.floor((low + high) / 2);

    try {
      const block = await provider.getBlock(mid);
      await delay(100);

      if (!block) {
        high = mid - 1;
        iterations++;
        continue;
      }

      if (block.timestamp <= targetTime) {
        blockNumber = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }

      iterations++;
    } catch (error) {
      console.warn(`Error getting block ${mid}:`, error.message);
      high = mid - 1;
      iterations++;
    }
  }

  return blockNumber;
}

// Utility functions (unchanged)
function validateAddress(address) {
  return {
    isValid: ethers.isAddress(address),
    checksumAddress: ethers.isAddress(address) ? ethers.getAddress(address) : null,
  };
}

async function getNetworkStatus() {
  try {
    const [blockNumber, gasPrice, network] = await Promise.all([provider.getBlockNumber(), provider.getFeeData(), provider.getNetwork()]);

    return {
      blockNumber,
      gasPrice: gasPrice.gasPrice?.toString(),
      network: network.name,
      chainId: network.chainId.toString(),
      etherscanConfigured: !!etherscanConfig.apiKey,
    };
  } catch (error) {
    throw new Error(`Failed to get network status: ${error.message}`);
  }
}

// Additional methods following the same pattern...
const getTransactionsByBlockRange = async (address, fromBlock, toBlock, type = "all") => {
  const allTxs = await getAllTransactions(address, fromBlock);
  return allTxs.filter((tx) => tx.blockNumber >= fromBlock && tx.blockNumber <= toBlock && (type === "all" || (type === "eth" && !tx.tokenSymbol) || (type === "token" && tx.tokenSymbol)));
};

const getTransactionsByType = async (address, transactionType, fromBlock = null) => {
  const allTxs = await getAllTransactions(address, fromBlock);
  return allTxs.filter((tx) => tx.type === transactionType);
};

const getTransactionsByAmountRange = async (address, minAmount, maxAmount, tokenSymbol = "all") => {
  let transactions;
  if (tokenSymbol === "all") {
    transactions = await getAllTransactions(address);
  } else if (tokenSymbol.toLowerCase() === "eth") {
    transactions = await getTransactions(address);
  } else {
    transactions = await getTokenTransactions(address);
    transactions = transactions.filter((tx) => tx.tokenSymbol?.toLowerCase() === tokenSymbol.toLowerCase());
  }

  return transactions.filter((tx) => {
    const value = parseFloat(tx.value || 0);
    return value >= minAmount && value <= maxAmount;
  });
};

const getTransactionPatterns = async (address, timeframe = "7d") => {
  // Convert timeframe to days and get transactions
  let days;
  if (timeframe.includes("d")) {
    days = parseInt(timeframe.replace("d", ""));
  } else if (timeframe.includes("h")) {
    days = Math.ceil(parseInt(timeframe.replace("h", "")) / 24);
  } else {
    days = 7; // Default
  }

  const allTxs = await getAllTransactions(address);
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentTxs = allTxs.filter((tx) => new Date(tx.timestamp * 1000).getTime() > cutoffTime);

  const patterns = {
    totalTransactions: recentTxs.length,
    timeScope: `${days} day(s)`,
    averagePerDay: days > 0 ? (recentTxs.length / days).toFixed(2) : "0",
    transactionTypes: {
      eth: recentTxs.filter((tx) => !tx.tokenSymbol).length,
      token: recentTxs.filter((tx) => tx.tokenSymbol).length,
      internal: recentTxs.filter((tx) => tx.type === "internal").length,
    },
    dataSource: "Etherscan API",
  };

  return patterns;
};

const getActivityTimeline = async (address, period = "daily", duration = "30d") => {
  // Convert duration to days
  let days;
  if (duration.includes("d")) {
    days = parseInt(duration.replace("d", ""));
  } else if (duration.includes("h")) {
    days = Math.ceil(parseInt(duration.replace("h", "")) / 24);
  } else {
    days = 30;
  }

  const allTxs = await getAllTransactions(address);
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentTxs = allTxs.filter((tx) => new Date(tx.timestamp * 1000).getTime() > cutoffTime);

  const timeline = {};

  recentTxs.forEach((tx) => {
    const date = new Date(tx.timestamp * 1000);
    let key;

    if (period === "hourly") {
      key = date.toISOString().slice(0, 13) + ":00:00.000Z";
    } else {
      key = date.toISOString().slice(0, 10) + "T00:00:00.000Z";
    }

    if (!timeline[key]) {
      timeline[key] = {
        timestamp: key,
        ethTransactions: 0,
        tokenTransactions: 0,
        internalTransactions: 0,
        totalVolume: 0,
      };
    }

    if (tx.type === "internal") {
      timeline[key].internalTransactions++;
    } else if (tx.tokenSymbol) {
      timeline[key].tokenTransactions++;
    } else {
      timeline[key].ethTransactions++;
    }

    timeline[key].totalVolume += parseFloat(tx.value || 0);
  });

  return Object.values(timeline).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

const getTransactionsAdvanced = async (filters) => {
  const { address, startDate, endDate, fromBlock, toBlock, transactionType, tokenSymbol, minAmount, maxAmount, limit = 100, offset = 0, sortBy = "blockNumber", sortOrder = "desc" } = filters;

  // Get base transaction set
  let transactions = await getAllTransactions(address, fromBlock);

  // Apply filters
  if (startDate && endDate) {
    const startTime = new Date(`${startDate}T00:00:00Z`).getTime() / 1000;
    const endTime = new Date(`${endDate}T23:59:59Z`).getTime() / 1000;

    transactions = transactions.filter((tx) => tx.timestamp >= startTime && tx.timestamp <= endTime);
  }

  if (toBlock) {
    transactions = transactions.filter((tx) => tx.blockNumber <= toBlock);
  }

  if (transactionType) {
    transactions = transactions.filter((tx) => tx.type === transactionType);
  }

  if (tokenSymbol && tokenSymbol !== "all") {
    if (tokenSymbol.toLowerCase() === "eth") {
      transactions = transactions.filter((tx) => !tx.tokenSymbol);
    } else {
      transactions = transactions.filter((tx) => tx.tokenSymbol?.toLowerCase() === tokenSymbol.toLowerCase());
    }
  }

  if (minAmount !== undefined || maxAmount !== undefined) {
    transactions = transactions.filter((tx) => {
      const value = parseFloat(tx.value || 0);
      const passesMin = minAmount === undefined || value >= minAmount;
      const passesMax = maxAmount === undefined || value <= maxAmount;
      return passesMin && passesMax;
    });
  }

  // Sort
  transactions.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === "value") {
      aVal = parseFloat(aVal || 0);
      bVal = parseFloat(bVal || 0);
    }

    return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
  });

  // Pagination
  const total = transactions.length;
  const paginatedTxs = transactions.slice(offset, offset + limit);

  return {
    transactions: paginatedTxs,
    total,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
    hasNextPage: offset + limit < total,
    hasPrevPage: offset > 0,
    metadata: {
      dataSource: "Etherscan API",
      filtersApplied: Object.keys(filters).length - 1, // -1 for address
    },
  };
};

// Token balance methods
const getTokenBalanceAtDate = async (address, tokenAddress, date) => {
  if (!ethers.isAddress(address) || !ethers.isAddress(tokenAddress)) {
    throw new Error("Invalid Ethereum address");
  }

  const targetTime = new Date(`${date}T00:00:00Z`).getTime() / 1000;

  if (isNaN(targetTime)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD");
  }

  try {
    const blockNumber = await findBlockByTimestamp(targetTime);
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await token.balanceOf(address, { blockTag: blockNumber });
    return balance.toString();
  } catch (error) {
    throw new Error(`Failed to get token balance: ${error.message}`);
  }
};

// Helper method to get block number from hours ago
const getBlockFromHoursAgo = async (hoursAgo = 1, blockTimeSeconds = 12) => {
  const latestBlock = await provider.getBlockNumber();
  const secondsAgo = hoursAgo * 60 * 60;
  const blocksAgo = Math.floor(secondsAgo / blockTimeSeconds);

  return Math.max(latestBlock - blocksAgo, 0);
};

export default {
  // Core transaction methods
  getTransactions,
  getInternalTransactions,
  getTokenTransactions,
  getNFTTransactions,
  getERC1155Transactions,
  getAllTransactions,

  // Balance methods
  getBalance,
  getMultipleBalances,
  getBalanceAtDate,
  getTokenBalanceAtDate,

  // Extended methods
  getExtendedTransactions,
  getExtendedTokenTransactions,

  // Filter methods
  getTransactionsByDateRange,
  getTransactionsByBlockRange,
  getTransactionsByToken,
  getTransactionsByType,
  getTransactionsByAmountRange,

  // Analytics methods
  getWalletAnalytics,
  getTransactionPatterns,
  getActivityTimeline,
  getTransactionsAdvanced,

  // Utility methods
  validateAddress,
  getNetworkStatus,
  getBlockFromHoursAgo,

  // Etherscan-specific methods
  getAddressFundedBy,
  getMinedBlocks,
  getBeaconWithdrawals,
};
