// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // backend Express server
});

// ETH transactions
export const getTransactions = async (address, fromBlock) => {
  const res = await api.get(`/transactions`, { params: { address, fromBlock } });
  return res.data;
};

// ETH balance at date
export const getBalanceAtDate = async (address, date) => {
  const res = await api.get(`/balanceAtDate`, { params: { address, date } });
  return res.data;
};

// Token transactions
export const getTokenTransactions = async (address, fromBlock) => {
  const res = await api.get(`/token-transactions`, { params: { address, fromBlock } });
  return res.data;
};

// Token balance at date
export const getTokenBalanceAtDate = async (address, token, date) => {
  const res = await api.get(`/token-balanceAtDate`, {
    params: { address, token, date },
  });
  return res.data;
};
