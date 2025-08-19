
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, Wallet, ChevronDown, Settings, LogOut, Moon, Sun, Globe, Copy, ExternalLink } from "lucide-react";
import useResponsive from "../core/hooks/useResponsive";
import { copyToClipboard, truncateAddress } from "../core/utils/HelperFunctions";
import { dropdownVariants } from "../core/animations/animations";

const NavBar = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3); // Mock notification count

  // Mock wallet data
  const walletData = {
    address: "0x742d35Cc6634C0532925a3b8D84A1738C6Fda7d9",
    balance: "2.45 ETH",
    usdValue: "$4,127.50",
  };

  const profileMenuItems = [
    { icon: User, label: "Profile", route: "/profile" },
    { icon: Settings, label: "Settings", route: "/settings" },
    { icon: isDarkMode ? Sun : Moon, label: isDarkMode ? "Light Mode" : "Dark Mode", action: () => setIsDarkMode(!isDarkMode) },
    { icon: LogOut, label: "Logout", route: "/logout", danger: true },
  ];

  const handleMenuItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      console.log(`Navigating to: ${item.route}`);
    }
    setIsProfileOpen(false);
  };

  return (
    <motion.nav
      className={`
        fixed top-0 right-0 h-16 z-20
        bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 
        border-b border-slate-700 shadow-2xl
        transition-all duration-300
        ${isMobile ? "left-0" : "left-20"}
      `}
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section - Logo & Search */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Logo - Only show on larger screens or when sidebar is collapsed */}
          {(isTablet || isDesktop) && (
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="text-white" size={16} />
              </div>
              <span className="text-white font-bold text-lg hidden lg:block">Web3 Wallet</span>
            </motion.div>
          )}

          {/* Search Bar */}
          <motion.div className="relative flex-1 max-w-md" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={isMobile ? "Search..." : "Search transactions, addresses..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Section - Wallet, Notifications, Profile */}
        <div className="flex items-center space-x-3">
          {/* Network Indicator */}
          <motion.div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-600" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">Ethereum</span>
            <Globe size={14} className="text-slate-400" />
          </motion.div>

          {/* Wallet Info */}
          <div className="relative">
            <motion.button
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setIsWalletOpen(!isWalletOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wallet size={16} />
              <span className="hidden sm:block font-medium">{walletData.balance}</span>
              <span className="sm:hidden font-medium">{truncateAddress(walletData.address)}</span>
              <motion.div animate={{ rotate: isWalletOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} />
              </motion.div>
            </motion.button>

            {/* Wallet Dropdown */}
            <AnimatePresence>
              {isWalletOpen && (
                <motion.div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden" variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">Wallet Balance</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{walletData.balance}</div>
                    <div className="text-slate-400 text-sm">{walletData.usdValue}</div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 text-sm">Address</span>
                      <div className="flex space-x-2">
                        <motion.button className="p-1 hover:bg-slate-700 rounded" onClick={() => copyToClipboard(walletData.address)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Copy size={14} className="text-slate-400" />
                        </motion.button>
                        <motion.button className="p-1 hover:bg-slate-700 rounded" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <ExternalLink size={14} className="text-slate-400" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="font-mono text-sm text-white bg-slate-900 px-3 py-2 rounded-lg break-all">{walletData.address}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <motion.button className="relative p-2 bg-slate-800 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => console.log("Notifications clicked")}>
            <Bell size={18} />
            {notifications > 0 && (
              <motion.div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                {notifications}
              </motion.div>
            )}
          </motion.button>

          {/* Profile Menu */}
          <div className="relative">
            <motion.button
              className="flex items-center space-x-2 p-2 bg-slate-800 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              {!isMobile && (
                <motion.div animate={{ rotate: isProfileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} />
                </motion.div>
              )}
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden" variants={dropdownVariants} initial="hidden" animate="visible" exit="hidden">
                  <div className="p-2">
                    {profileMenuItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.button
                          key={item.label}
                          className={`
                            w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                            ${item.danger ? "text-red-400 hover:bg-red-600 hover:text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white"}
                          `}
                          onClick={() => handleMenuItemClick(item)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Icon size={16} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet overlay for dropdowns */}
      <AnimatePresence>
        {(isMobile || isTablet) && (isProfileOpen || isWalletOpen) && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsProfileOpen(false);
              setIsWalletOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavBar;
