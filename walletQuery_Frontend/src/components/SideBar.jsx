
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Menu, X, LogOut, ChevronRight, ChevronLeft } from "lucide-react";
import useResponsive from "../core/hooks/useResponsive";
import { useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "../core/data/MenuItems";

// Import helper functions and animations
import { isRouteActive, handleMenuClick, handleLogout, toggleSidebar, initializeSidebarState } from "../core/utils/HelperFunctions";

import { sidebarVariants, itemVariants, menuIconVariants, chevronVariants, activeIndicatorTransition, activeArrowVariants } from "../core/animations/animations";

const SideBar = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Set initial state based on device type
  useEffect(() => {
    initializeSidebarState(isMobile, isTablet, isDesktop, setIsOpen, setIsCollapsed);
  }, [isMobile, isTablet, isDesktop]);

  const showContent = isMobile ? isOpen : !isCollapsed;

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          className="fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg border border-blue-500/20"
          onClick={() => toggleSidebar(isMobile, isOpen, setIsOpen, isCollapsed, setIsCollapsed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" {...menuIconVariants.close}>
                <X size={18} />
              </motion.div>
            ) : (
              <motion.div key="menu" {...menuIconVariants.menu}>
                <Menu size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>{isMobile && isOpen && <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} />}</AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`
          fixed left-0 top-0 h-full 
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
          border-r border-slate-700 shadow-xl z-50
          ${isMobile ? "w-64" : isCollapsed ? "w-12" : "w-40"}
        `}
        variants={isMobile ? sidebarVariants.mobile : sidebarVariants.desktop}
        initial={isMobile ? "closed" : "expanded"}
        animate={isMobile ? (isOpen ? "open" : "closed") : isCollapsed ? "collapsed" : "expanded"}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <motion.div className="flex items-center space-x-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wallet className="text-white" size={18} />
            </div>
            <AnimatePresence>
              {showContent && (
                <motion.div variants={itemVariants} initial="hide" animate="show" exit="hide">
                  <h1 className="text-lg font-bold text-white">Web3 Wallet</h1>
                  <p className="text-xs text-slate-400">Decentralized Finance</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.route, location);

              return (
                <motion.button
                  key={item.id}
                  className={`
                    w-full flex items-center rounded-lg
                    transition-all duration-200 group relative overflow-hidden
                    ${showContent ? "space-x-3 px-3 py-2.5" : "justify-center p-2.5"}
                    ${isActive ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
                  `}
                  onClick={() => handleMenuClick(item.route, navigate, isMobile, setIsOpen)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  title={!showContent ? item.label : ""}
                >
                  {/* Active indicator */}
                  {isActive && <motion.div className="absolute left-0 top-0 w-1 h-full bg-white rounded-r-full" layoutId="activeIndicator" transition={activeIndicatorTransition} />}

                  {/* Icon */}
                  <div
                    className={`
                      flex-shrink-0 rounded-md
                      ${showContent ? "p-1.5" : "p-0"}
                      ${isActive ? "bg-white bg-opacity-20" : "group-hover:bg-slate-700"}
                    `}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Label and Description */}
                  <AnimatePresence>
                    {showContent && (
                      <motion.div className="flex-1 text-left" variants={itemVariants} initial="hide" animate="show" exit="hide">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Arrow for active item */}
                  <AnimatePresence>
                    {showContent && isActive && (
                      <motion.div {...activeArrowVariants}>
                        <ChevronRight size={14} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-3">
          <motion.button
            className={`
              w-full flex items-center rounded-lg
              text-slate-300 hover:bg-red-600 hover:text-white 
              transition-all duration-200 group
              ${showContent ? "space-x-3 px-3 py-2.5" : "justify-center p-2.5"}
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLogout(isMobile, setIsOpen, navigate)}
            title={!showContent ? "Logout" : ""}
          >
            <div className={`flex-shrink-0 rounded-md group-hover:bg-red-700 ${showContent ? "p-1.5" : "p-0"}`}>
              <LogOut size={18} />
            </div>
            <AnimatePresence>
              {showContent && (
                <motion.div className="flex-1 text-left" variants={itemVariants} initial="hide" animate="show" exit="hide">
                  <div className="font-medium text-sm">Logout</div>
                  <div className="text-xs opacity-70">Disconnect wallet</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Collapse Button for Desktop/Tablet */}
        {!isMobile && (
          <motion.button
            className="absolute -right-2.5 top-16 w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg border border-blue-500/20"
            onClick={() => toggleSidebar(isMobile, isOpen, setIsOpen, isCollapsed, setIsCollapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }} transition={chevronVariants.transition}>
              <ChevronLeft size={10} />
            </motion.div>
          </motion.button>
        )}
      </motion.div>
    </>
  );
};

export default SideBar;
