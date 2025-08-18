import React, { createContext, useContext, useState } from "react";
import { getTransactions, getBalanceAtDate, getTokenTransactions, getTokenBalanceAtDate } from "../services/api";

// Create context
const BlockchainContext = createContext();

// Provider component
export const BlockchainProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [tokenTransactions, setTokenTransactions] = useState([]);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---- API calls ----
  const fetchTransactions = async (address, fromBlock) => {
    setLoading(true);
    try {
      const data = await getTransactions(address, fromBlock);
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceAtDate = async (address, date) => {
    setLoading(true);
    try {
      const data = await getBalanceAtDate(address, date);
      setBalance(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenTransactions = async (address, fromBlock) => {
    setLoading(true);
    try {
      const data = await getTokenTransactions(address, fromBlock);
      setTokenTransactions(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenBalanceAtDate = async (address, token, date) => {
    setLoading(true);
    try {
      const data = await getTokenBalanceAtDate(address, token, date);
      setTokenBalance(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        transactions,
        balance,
        tokenTransactions,
        tokenBalance,
        loading,
        fetchTransactions,
        fetchBalanceAtDate,
        fetchTokenTransactions,
        fetchTokenBalanceAtDate,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};

// Hook for consuming context
export const useBlockchain = () => useContext(BlockchainContext);
