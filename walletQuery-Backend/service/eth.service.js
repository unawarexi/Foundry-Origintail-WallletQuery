// src/services/ethService.js
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// ----------------- Provider Setup -----------------
const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
// example: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"

// ERC20 ABI (minimal for balance + Transfer events)
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)", "event Transfer(address indexed from, address indexed to, uint256 value)"];

// ----------------- Services -----------------

/**
 * Get all ETH transactions for a wallet from a given block
 */
async function getTransactions(address, fromBlock) {
  const latestBlock = await provider.getBlockNumber();
  const txs = [];

  // NOTE: naive approach (loop); better is to use Etherscan API for speed.
  for (let block = Number(fromBlock); block <= latestBlock; block++) {
    const blockData = await provider.getBlock(block, true); // include txs
    if (!blockData || !blockData.transactions) continue;

    for (let tx of blockData.transactions) {
      if (tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase()) {
        txs.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          blockNumber: tx.blockNumber,
          timestamp: (await provider.getBlock(tx.blockNumber)).timestamp,
        });
      }
    }
  }

  return txs;
}

/**
 * Get ETH balance at a specific date (00:00 UTC)
 */
async function getBalanceAtDate(address, date) {
  const targetTime = new Date(`${date}T00:00:00Z`).getTime() / 1000;

  // Binary search to find the block closest to the date
  let low = 0;
  let high = await provider.getBlockNumber();
  let blockNumber;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await provider.getBlock(mid);

    if (!block) break;

    if (block.timestamp < targetTime) {
      low = mid + 1;
      blockNumber = mid;
    } else {
      high = mid - 1;
    }
  }

  const balance = await provider.getBalance(address, blockNumber);
  return ethers.formatEther(balance);
}

/**
 * Get ERC20 token transfer transactions for a wallet
 */
async function getTokenTransactions(address, fromBlock) {
  const latestBlock = await provider.getBlockNumber();
  const filter = {
    topics: [ethers.id("Transfer(address,address,uint256)"), null, null],
    fromBlock: Number(fromBlock),
    toBlock: latestBlock,
  };

  const logs = await provider.getLogs(filter);
  const transfers = [];

  for (let log of logs) {
    const parsed = new ethers.Interface(ERC20_ABI).parseLog(log);

    if (parsed.args.from.toLowerCase() === address.toLowerCase() || parsed.args.to.toLowerCase() === address.toLowerCase()) {
      transfers.push({
        token: log.address,
        from: parsed.args.from,
        to: parsed.args.to,
        value: parsed.args.value.toString(),
        blockNumber: log.blockNumber,
        timestamp: (await provider.getBlock(log.blockNumber)).timestamp,
      });
    }
  }

  return transfers;
}

/**
 * Get ERC20 token balance at a specific date
 */
async function getTokenBalanceAtDate(address, tokenAddress, date) {
  const targetTime = new Date(`${date}T00:00:00Z`).getTime() / 1000;

  // Binary search block by timestamp
  let low = 0;
  let high = await provider.getBlockNumber();
  let blockNumber;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await provider.getBlock(mid);

    if (!block) break;

    if (block.timestamp < targetTime) {
      low = mid + 1;
      blockNumber = mid;
    } else {
      high = mid - 1;
    }
  }

  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await token.balanceOf(address, { blockTag: blockNumber });
  return balance.toString();
}

// ----------------- Exports -----------------
export default {
  getTransactions,
  getBalanceAtDate,
  getTokenTransactions,
  getTokenBalanceAtDate,
};
