/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Activity, CreditCard, Menu, X, Home, Settings, LogOut, ChevronRight } from "lucide-react";
import useResponsive from "../core/hooks/useResponsive";
import { Link } from "react-router-dom";

const SideBar = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [activeRoute, setActiveRoute] = useState("/dashboard");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      route: "/dashboard",
      description: "Overview",
    },
    {
      id: "balance",
      label: "Balance",
      icon: Wallet,
      route: "/balance",
      description: "View wallet balance",
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Activity,
      route: "/transactions",
      description: "Transaction history",
    },
    {
      id: "cards",
      label: "Cards",
      icon: CreditCard,
      route: "/cards",
      description: "Manage cards",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      route: "/settings",
      description: "App settings",
    },
  ];

  const handleMenuClick = (route) => {
    setActiveRoute(route);
    if (isMobile) {
      setIsOpen(false);
    }
    // Here you would handle actual routing
    console.log(`Navigating to: ${route}`);
  };

  const sidebarVariants = {
    open: {
      x: 0,
      width: isMobile ? "100%" : isTablet ? "280px" : "320px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: isMobile ? "-100%" : "-100%",
      width: isMobile ? "100%" : "80px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button className="fixed top-4 left-4  p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg" onClick={() => setIsOpen(!isOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: 0 }} animate={{ rotate: 0 }} exit={{ rotate: 180 }}>
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 180 }} animate={{ rotate: 0 }} exit={{ rotate: 0 }}>
                <Menu size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>{isMobile && isOpen && <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-40" variants={overlayVariants} initial="closed" animate="open" exit="closed" onClick={() => setIsOpen(false)} />}</AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`
          fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
          border-r border-slate-700 shadow-2xl z-50
          ${isMobile ? "w-full" : isOpen ? (isTablet ? "w-70" : "w-80") : "w-20"}
        `}
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <motion.div className="flex items-center space-x-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="text-white" size={20} />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div variants={itemVariants} initial="closed" animate="open" exit="closed">
                  <h1 className="text-xl font-bold text-white">Web3 Wallet</h1>
                  <p className="text-xs text-slate-400">Decentralized Finance</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6">
          <nav className="space-y-2 px-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.route;

              return (
                
                <motion.button
                  key={item.id}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-200 group relative overflow-hidden
                    ${isActive ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                  `}
                  onClick={() => handleMenuClick(item.route)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 w-1 h-full bg-white rounded-r-full"
                      layoutId="activeIndicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`
                    flex-shrink-0 p-2 rounded-lg
                    ${isActive ? "bg-white bg-opacity-20" : "group-hover:bg-slate-700"}
                  `}
                  >
                    <Icon size={20} />
                  </div>

                  {/* Label and Description */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div className="flex-1 text-left" variants={itemVariants} initial="closed" animate="open" exit="closed">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Arrow for active item */}
                  <AnimatePresence>
                    {isOpen && isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <ChevronRight size={16} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4">
          <motion.button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200 group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => console.log("Logout clicked")}>
            <div className="flex-shrink-0 p-2 rounded-lg group-hover:bg-red-700">
              <LogOut size={20} />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div className="flex-1 text-left" variants={itemVariants} initial="closed" animate="open" exit="closed">
                  <div className="font-medium">Logout</div>
                  <div className="text-xs opacity-70">Disconnect wallet</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Collapse Button for Desktop */}
        {!isMobile && (
          <motion.button className="absolute -right-3 top-20 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg" onClick={() => setIsOpen(!isOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronRight size={12} />
            </motion.div>
          </motion.button>
        )}
      </motion.div>

      {/* Content Spacer */}
      {!isMobile && <div className={`transition-all duration-300 ${isOpen ? (isTablet ? "w-70" : "w-80") : "w-20"}`} />}
    </>
  );
};

export default SideBar;
