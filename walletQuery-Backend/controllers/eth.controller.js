// src/controllers/transactions.controller.js
import ethService from "../service/eth.service.js";

export async function getTransactions(req, res) {
  try {
    const { address, fromBlock } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const fromBlockValue = fromBlock !== undefined ? fromBlock : null;
    const data = await ethService.getTransactions(address, fromBlockValue);
    res.json(data);
  } catch (err) {
    console.error("Error in getTransactions:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getBalanceAtDate(req, res) {
  try {
    const { address, date } = req.query;

    if (!address || !date) {
      return res.status(400).json({ error: "Address and date parameters are required" });
    }

    const balance = await ethService.getBalanceAtDate(address, date);
    res.json({ balance });
  } catch (err) {
    console.error("Error in getBalanceAtDate:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getTokenTransactions(req, res) {
  try {
    const { address, contractAddress, fromBlock } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const fromBlockValue = fromBlock !== undefined ? fromBlock : null;
    const data = await ethService.getTokenTransactions(address, contractAddress, fromBlockValue);
    res.json(data);
  } catch (err) {
    console.error("Error in getTokenTransactions:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getTokenBalanceAtDate(req, res) {
  try {
    const { address, token, date } = req.query;

    if (!address || !token || !date) {
      return res.status(400).json({ error: "Address, token, and date parameters are required" });
    }

    const balance = await ethService.getTokenBalanceAtDate(address, token, date);
    res.json({ balance });
  } catch (err) {
    console.error("Error in getTokenBalanceAtDate:", err);
    res.status(500).json({ error: err.message });
  }
}

// Extended history endpoints
export async function getExtendedTransactions(req, res) {
  try {
    const { address, daysBack = 7 } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    if (daysBack > 30) {
      return res.status(400).json({ error: "Maximum 30 days of history allowed" });
    }

    const data = await ethService.getExtendedTransactions(address, parseInt(daysBack));
    res.json(data);
  } catch (err) {
    console.error("Error in getExtendedTransactions:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getExtendedTokenTransactions(req, res) {
  try {
    const { address, daysBack = 7 } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    if (daysBack > 30) {
      return res.status(400).json({ error: "Maximum 30 days of history allowed" });
    }

    const data = await ethService.getExtendedTokenTransactions(address, parseInt(daysBack));
    res.json(data);
  } catch (err) {
    console.error("Error in getExtendedTokenTransactions:", err);
    res.status(500).json({ error: err.message });
  }
}

// All transactions endpoint
export async function getAllTransactions(req, res) {
  try {
    const { address, fromBlock } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const fromBlockValue = fromBlock !== undefined ? fromBlock : null;
    const data = await ethService.getAllTransactions(address, fromBlockValue);
    res.json(data);
  } catch (err) {
    console.error("Error in getAllTransactions:", err);
    res.status(500).json({ error: err.message });
  }
}

// New endpoint for internal transactions
export async function getInternalTransactions(req, res) {
  try {
    const { address, fromBlock } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const fromBlockValue = fromBlock !== undefined ? fromBlock : null;
    const data = await ethService.getInternalTransactions(address, fromBlockValue);
    res.json(data);
  } catch (err) {
    console.error("Error in getInternalTransactions:", err);
    res.status(500).json({ error: err.message });
  }
}

// New endpoint for NFT transactions
export async function getNFTTransactions(req, res) {
  try {
    const { address, contractAddress, fromBlock } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const fromBlockValue = fromBlock !== undefined ? fromBlock : null;
    const data = await ethService.getNFTTransactions(address, contractAddress, fromBlockValue);
    res.json(data);
  } catch (err) {
    console.error("Error in getNFTTransactions:", err);
    res.status(500).json({ error: err.message });
  }
}

// New endpoint for ERC1155 transactions
export async function getERC1155Transactions(req, res) {
  try {
    const { address, contractAddress, fromBlock } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const fromBlockValue = fromBlock !== undefined ? fromBlock : null;
    const data = await ethService.getERC1155Transactions(address, contractAddress, fromBlockValue);
    res.json(data);
  } catch (err) {
    console.error("Error in getERC1155Transactions:", err);
    res.status(500).json({ error: err.message });
  }
}

// New endpoint for multiple balances
export async function getMultipleBalances(req, res) {
  try {
    const { addresses } = req.query;

    if (!addresses) {
      return res.status(400).json({ error: "Addresses parameter is required" });
    }

    const addressList = addresses.split(",").map((addr) => addr.trim());

    if (addressList.length > 20) {
      return res.status(400).json({ error: "Maximum 20 addresses per request" });
    }

    const data = await ethService.getMultipleBalances(addressList);
    res.json(data);
  } catch (err) {
    console.error("Error in getMultipleBalances:", err);
    res.status(500).json({ error: err.message });
  }
}

// New endpoint for address funding information
export async function getAddressFundedBy(req, res) {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const data = await ethService.getAddressFundedBy(address);
    res.json(data);
  } catch (err) {
    console.error("Error in getAddressFundedBy:", err);
    res.status(500).json({ error: err.message });
  }
}

// New endpoint for mined blocks
export async function getMinedBlocks(req, res) {
  try {
    const { address, blocktype = "blocks" } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    if (!["blocks", "uncles"].includes(blocktype)) {
      return res.status(400).json({ error: "Blocktype must be 'blocks' or 'uncles'" });
    }

    const data = await ethService.getMinedBlocks(address, blocktype);
    res.json(data);
  } catch (err) {
    console.error("Error in getMinedBlocks:", err);
    res.status(500).json({ error: err.message });
  }
}

// New endpoint for beacon chain withdrawals
export async function getBeaconWithdrawals(req, res) {
  try {
    const { address, fromBlock } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const fromBlockValue = fromBlock !== undefined ? fromBlock : null;
    const data = await ethService.getBeaconWithdrawals(address, fromBlockValue);
    res.json(data);
  } catch (err) {
    console.error("Error in getBeaconWithdrawals:", err);
    res.status(500).json({ error: err.message });
  }
}

// Enhanced endpoint for current balance
export async function getBalance(req, res) {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const balance = await ethService.getBalance(address);
    res.json({ address, balance });
  } catch (err) {
    console.error("Error in getBalance:", err);
    res.status(500).json({ error: err.message });
  }
}

// Filter endpoints (unchanged but now with enhanced data)
export async function getTransactionsByDateRange(req, res) {
  try {
    const { address, startDate, endDate, type = "all" } = req.query;

    if (!address || !startDate || !endDate) {
      return res.status(400).json({ error: "Address, startDate, and endDate parameters are required" });
    }

    const data = await ethService.getTransactionsByDateRange(address, startDate, endDate, type);
    res.json(data);
  } catch (err) {
    console.error("Error in getTransactionsByDateRange:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getTransactionsByBlockRange(req, res) {
  try {
    const { address, fromBlock, toBlock, type = "all" } = req.query;

    if (!address || !fromBlock || !toBlock) {
      return res.status(400).json({ error: "Address, fromBlock, and toBlock parameters are required" });
    }

    const data = await ethService.getTransactionsByBlockRange(address, parseInt(fromBlock), parseInt(toBlock), type);
    res.json(data);
  } catch (err) {
    console.error("Error in getTransactionsByBlockRange:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getTransactionsByToken(req, res) {
  try {
    const { address, tokenSymbol, fromBlock } = req.query;

    if (!address || !tokenSymbol) {
      return res.status(400).json({ error: "Address and tokenSymbol parameters are required" });
    }

    const fromBlockValue = fromBlock !== undefined ? fromBlock : null;
    const data = await ethService.getTransactionsByToken(address, tokenSymbol, fromBlockValue);
    res.json(data);
  } catch (err) {
    console.error("Error in getTransactionsByToken:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getTransactionsByType(req, res) {
  try {
    const { address, type, fromBlock } = req.query;

    if (!address || !type) {
      return res.status(400).json({ error: "Address and type parameters are required" });
    }

    const fromBlockValue = fromBlock !== undefined ? fromBlock : null;
    const data = await ethService.getTransactionsByType(address, type, fromBlockValue);
    res.json(data);
  } catch (err) {
    console.error("Error in getTransactionsByType:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getTransactionsByAmountRange(req, res) {
  try {
    const { address, minAmount, maxAmount, tokenSymbol = "all" } = req.query;

    if (!address || minAmount === undefined || maxAmount === undefined) {
      return res.status(400).json({ error: "Address, minAmount, and maxAmount parameters are required" });
    }

    const data = await ethService.getTransactionsByAmountRange(address, parseFloat(minAmount), parseFloat(maxAmount), tokenSymbol);
    res.json(data);
  } catch (err) {
    console.error("Error in getTransactionsByAmountRange:", err);
    res.status(500).json({ error: err.message });
  }
}

// Analytics endpoints (enhanced with Etherscan data)
export async function getWalletAnalytics(req, res) {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const data = await ethService.getWalletAnalytics(address);
    res.json(data);
  } catch (err) {
    console.error("Error in getWalletAnalytics:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getTransactionPatterns(req, res) {
  try {
    const { address, timeframe = "7d" } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const data = await ethService.getTransactionPatterns(address, timeframe);
    res.json(data);
  } catch (err) {
    console.error("Error in getTransactionPatterns:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getActivityTimeline(req, res) {
  try {
    const { address, period = "daily", duration = "30d" } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const data = await ethService.getActivityTimeline(address, period, duration);
    res.json(data);
  } catch (err) {
    console.error("Error in getActivityTimeline:", err);
    res.status(500).json({ error: err.message });
  }
}

// Advanced search endpoint (enhanced)
export async function getTransactionsAdvanced(req, res) {
  try {
    const { address, startDate, endDate, fromBlock, toBlock, transactionType, tokenSymbol, minAmount, maxAmount, limit = 100, offset = 0, sortBy = "blockNumber", sortOrder = "desc" } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const filters = {
      address,
      startDate,
      endDate,
      fromBlock: fromBlock ? parseInt(fromBlock) : undefined,
      toBlock: toBlock ? parseInt(toBlock) : undefined,
      transactionType,
      tokenSymbol,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder,
    };

    const data = await ethService.getTransactionsAdvanced(filters);
    res.json(data);
  } catch (err) {
    console.error("Error in getTransactionsAdvanced:", err);
    res.status(500).json({ error: err.message });
  }
}

// Utility endpoints (enhanced)
export async function validateAddress(req, res) {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    const data = ethService.validateAddress(address);
    res.json(data);
  } catch (err) {
    console.error("Error in validateAddress:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function getNetworkStatus(req, res) {
  try {
    const data = await ethService.getNetworkStatus();
    res.json(data);
  } catch (err) {
    console.error("Error in getNetworkStatus:", err);
    res.status(500).json({ error: err.message });
  }
}

// Export endpoints (enhanced with new transaction types)
export async function exportTransactionsCSV(req, res) {
  try {
    const { address, ...filters } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    // Get transactions based on filters
    let transactions;
    if (Object.keys(filters).length > 0) {
      transactions = await ethService.getTransactionsAdvanced({ address, ...filters });
      transactions = transactions.transactions; // Extract from paginated response
    } else {
      transactions = await ethService.getAllTransactions(address);
    }

    // Enhanced CSV headers
    const headers = ["Transaction Hash", "Block Number", "Timestamp", "Type", "From", "To", "Value", "Token Symbol", "Token Name", "Contract Address", "Gas Used", "Gas Price", "Status"];

    const rows = transactions.map((tx) => [
      tx.hash || "",
      tx.blockNumber || "",
      tx.timestamp ? new Date(tx.timestamp * 1000).toISOString() : "",
      tx.type || "",
      tx.from || "",
      tx.to || "",
      tx.value || "0",
      tx.tokenSymbol || "ETH",
      tx.tokenName || "",
      tx.contractAddress || "",
      tx.gasUsed || "",
      tx.gasPrice || "",
      tx.status || "success",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="transactions_${address.slice(0, 8)}.csv"`);
    res.send(csvContent);
  } catch (err) {
    console.error("Error in exportTransactionsCSV:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function exportTransactionsJSON(req, res) {
  try {
    const { address, ...filters } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter is required" });
    }

    // Get transactions based on filters
    let transactions;
    if (Object.keys(filters).length > 0) {
      transactions = await ethService.getTransactionsAdvanced({ address, ...filters });
      transactions = transactions.transactions; // Extract from paginated response
    } else {
      transactions = await ethService.getAllTransactions(address);
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="transactions_${address.slice(0, 8)}.json"`);
    res.json({
      address,
      exportedAt: new Date().toISOString(),
      totalTransactions: transactions.length,
      dataSource: "Etherscan API + Provider",
      transactions,
    });
  } catch (err) {
    console.error("Error in exportTransactionsJSON:", err);
    res.status(500).json({ error: err.message });
  }
}
