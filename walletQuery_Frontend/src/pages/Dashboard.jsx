/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Calendar, Layers, TrendingUp, Wallet, Activity, DollarSign, Users, ArrowUpRight, ArrowDownLeft, Copy, ExternalLink, Clock, Hash, ChevronDown, X } from "lucide-react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [selectedBlockFilter, setSelectedBlockFilter] = useState("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");

  // Mock data for transactions
  const [transactions] = useState([
    {
      id: 1,
      hash: "0x1234...5678",
      type: "send",
      amount: "-0.5 ETH",
      to: "0xabcd...efgh",
      timestamp: "2 hours ago",
      block: "18,345,678",
      status: "confirmed",
    },
    {
      id: 2,
      hash: "0x9876...5432",
      type: "receive",
      amount: "+1.2 ETH",
      from: "0xijkl...mnop",
      timestamp: "5 hours ago",
      block: "18,345,234",
      status: "confirmed",
    },
    {
      id: 3,
      hash: "0x1111...2222",
      type: "swap",
      amount: "500 USDC → 0.3 ETH",
      platform: "Uniswap",
      timestamp: "1 day ago",
      block: "18,344,123",
      status: "confirmed",
    },
  ]);

  const stats = [
    {
      id: 1,
      title: "Total Balance",
      value: "2.847 ETH",
      change: "+12.5%",
      changeType: "positive",
      icon: Wallet,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      id: 2,
      title: "Portfolio Value",
      value: "$5,234.56",
      change: "+8.2%",
      changeType: "positive",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      id: 3,
      title: "Active Transactions",
      value: "24",
      change: "+3",
      changeType: "positive",
      icon: Activity,
      gradient: "from-orange-500 to-red-600",
    },
    {
      id: 4,
      title: "Connected DApps",
      value: "7",
      change: "+2",
      changeType: "positive",
      icon: Users,
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
    // Here you would implement actual search functionality
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const filterOptions = {
    date: [
      { value: "all", label: "All Time" },
      { value: "today", label: "Today" },
      { value: "week", label: "This Week" },
      { value: "month", label: "This Month" },
      { value: "year", label: "This Year" },
    ],
    block: [
      { value: "all", label: "All Blocks" },
      { value: "latest", label: "Latest Block" },
      { value: "confirmed", label: "Confirmed Only" },
      { value: "pending", label: "Pending Only" },
    ],
    type: [
      { value: "all", label: "All Types" },
      { value: "send", label: "Send" },
      { value: "receive", label: "Receive" },
      { value: "swap", label: "Swap" },
      { value: "stake", label: "Stake" },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Web3 Dashboard</h1>
          <p className="text-slate-400">Monitor your wallet activity and manage your decentralized assets</p>
        </motion.div>

        {/* Search Section */}
        <motion.div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700 shadow-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Wallet Address or Transaction Hash</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="0x... or transaction hash"
                  className="w-full px-4 py-3 pl-12 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <motion.button
                onClick={handleSearch}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-2">
                  <Search size={18} />
                  <span>Search</span>
                </div>
              </motion.button>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-end">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 border border-slate-600 rounded-xl font-medium transition-all duration-200 shadow-lg ${showFilters ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-2">
                  <Filter size={18} />
                  <span>Filters</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div className="mt-6 pt-6 border-t border-slate-700" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Date Range
                    </label>
                    <select value={selectedDateFilter} onChange={(e) => setSelectedDateFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {filterOptions.date.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Block Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Layers size={16} className="inline mr-2" />
                      Block Status
                    </label>
                    <select value={selectedBlockFilter} onChange={(e) => setSelectedBlockFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {filterOptions.block.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transaction Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <Activity size={16} className="inline mr-2" />
                      Transaction Type
                    </label>
                    <select value={selectedTypeFilter} onChange={(e) => setSelectedTypeFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {filterOptions.type.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <motion.button
                    onClick={() => {
                      setSelectedDateFilter("all");
                      setSelectedBlockFilter("all");
                      setSelectedTypeFilter("all");
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear All Filters
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} bg-opacity-20`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className={`text-sm font-medium ${stat.changeType === "positive" ? "text-green-400" : "text-red-400"}`}>{stat.change}</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-slate-400 text-sm">{stat.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <motion.div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              <motion.button className="text-slate-400 hover:text-white transition-colors duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ExternalLink size={20} />
              </motion.button>
            </div>
          </div>

          <div className="divide-y divide-slate-700">
            {transactions.map((tx, index) => (
              <motion.div key={tx.id} className="p-6 hover:bg-slate-750 transition-all duration-200 group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }} whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.5)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Transaction Icon */}
                    <div className={`p-3 rounded-xl ${tx.type === "send" ? "bg-red-500 bg-opacity-20" : tx.type === "receive" ? "bg-green-500 bg-opacity-20" : "bg-blue-500 bg-opacity-20"}`}>
                      {tx.type === "send" ? <ArrowUpRight className={`${tx.type === "send" ? "text-red-400" : "text-blue-400"}`} size={20} /> : tx.type === "receive" ? <ArrowDownLeft className="text-green-400" size={20} /> : <Activity className="text-blue-400" size={20} />}
                    </div>

                    {/* Transaction Details */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium capitalize">{tx.type}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400 text-sm">{tx.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Hash size={14} className="text-slate-500" />
                        <span className="text-slate-400 text-sm font-mono">{tx.hash}</span>
                        <motion.button onClick={() => copyToClipboard(tx.hash)} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Copy size={14} className="text-slate-500 hover:text-slate-300" />
                        </motion.button>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Layers size={14} className="text-slate-500" />
                        <span className="text-slate-400 text-sm">Block {tx.block}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Status */}
                  <div className="text-right">
                    <div className={`text-lg font-bold ${tx.type === "send" ? "text-red-400" : tx.type === "receive" ? "text-green-400" : "text-blue-400"}`}>{tx.amount}</div>
                    <div className="flex items-center justify-end space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-slate-400 text-sm capitalize">{tx.status}</span>
                    </div>
                    {(tx.to || tx.from) && <div className="text-slate-500 text-xs mt-1 font-mono">{tx.type === "send" ? `To: ${tx.to}` : tx.from ? `From: ${tx.from}` : tx.platform}</div>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <div className="p-6 border-t border-slate-700 text-center">
            <motion.button className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              View All Transactions →
            </motion.button>
          </div>
        </motion.div>

        
      </div>
    </div>
  );
};

export default Dashboard;
