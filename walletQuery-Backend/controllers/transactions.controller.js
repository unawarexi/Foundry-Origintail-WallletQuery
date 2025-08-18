// Extracts request params, calls service, returns response.

// src/controllers/transactionsController.js

import ethService from "../service/eth.service.js";

export async function getTransactions(req, res) {
  try {
    const { address, fromBlock } = req.query;
    const data = await ethService.getTransactions(address, fromBlock);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBalanceAtDate(req, res) {
  try {
    const { address, date } = req.query;
    const balance = await ethService.getBalanceAtDate(address, date);
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTokenTransactions(req, res) {
  try {
    const { address, fromBlock } = req.query;
    const data = await ethService.getTokenTransactions(address, fromBlock);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTokenBalanceAtDate(req, res) {
  try {
    const { address, token, date } = req.query;
    const balance = await ethService.getTokenBalanceAtDate(address, token, date);
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
