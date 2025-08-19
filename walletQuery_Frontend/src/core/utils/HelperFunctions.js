export const isRouteActive = (route, location) => {
  if (route === "/dashboard" && (location.pathname === "/" || location.pathname === "/dashboard")) {
    return true;
  }
  return location.pathname === route;
};

export const handleMenuClick = (route, navigate, isMobile, setIsOpen) => {
  navigate(route);
  if (isMobile) {
    setIsOpen(false);
  }
};

export const handleLogout = (isMobile, setIsOpen, navigate = null) => {
  console.log("Logout clicked");
  if (isMobile) {
    setIsOpen(false);
  }
  // Uncomment when ready to implement logout navigation
  // if (navigate) navigate("/login");
};

export const toggleSidebar = (isMobile, isOpen, setIsOpen, isCollapsed, setIsCollapsed) => {
  if (isMobile) {
    setIsOpen(!isOpen);
  } else {
    setIsCollapsed(!isCollapsed);
  }
};

export const initializeSidebarState = (isMobile, isTablet, isDesktop, setIsOpen, setIsCollapsed) => {
  if (isMobile) {
    setIsOpen(false);
    setIsCollapsed(false);
  } else if (isTablet) {
    setIsOpen(true);
    setIsCollapsed(false);
  } else if (isDesktop) {
    setIsOpen(true);
    setIsCollapsed(false);
  }
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  console.log("Address copied to clipboard");
};

export const truncateAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
