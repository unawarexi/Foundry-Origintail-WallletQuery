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


export const isValidAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const formatNFTData = (nft) => {
  if (!nft) return null;

  return {
    id: nft.identifier || nft.token_id,
    name: nft.name || `#${nft.identifier || nft.token_id}`,
    description: nft.description,
    imageUrl: nft.image_url || nft.display_image_url,
    animationUrl: nft.animation_url,
    collection: nft.collection,
    contract: nft.contract,
    tokenStandard: nft.token_standard,
    openseaUrl: nft.opensea_url,
    traits: nft.traits || [],
    rarity: nft.rarity,
    lastSale: nft.last_sale,
    floorPrice: nft.collection?.floor_price,
    owners: nft.owners,
  };
};

export const formatCollectionData = (collection) => {
  if (!collection) return null;

  return {
    slug: collection.collection,
    name: collection.name || collection.collection,
    description: collection.description,
    imageUrl: collection.image_url || collection.sample_nft?.image_url,
    bannerImageUrl: collection.banner_image_url,
    openseaUrl: collection.opensea_url,
    contract: collection.contract,
    tokenStandard: collection.token_standard,
    totalSupply: collection.total_supply,
    floorPrice: collection.floor_price,
    volume: collection.volume,
    owners: collection.owners,
    verified: collection.safelist_status === "verified",
  };
};


export const calculateNFTSummary = (nfts = [], collections = []) => {
  const summary = {
    totalNFTs: 0,
    totalCollections: 0,
    totalEstimatedValue: 0,
    topCollections: [],
    recentActivity: [],
    tokenStandards: {},
    chains: {},
  };

  // Process NFTs
  if (Array.isArray(nfts)) {
    summary.totalNFTs = nfts.length;

    nfts.forEach((nft) => {
      // Count token standards
      const standard = nft.token_standard || "unknown";
      summary.tokenStandards[standard] = (summary.tokenStandards[standard] || 0) + 1;

      // Estimate value from floor prices
      if (nft.collection?.floor_price?.value) {
        summary.totalEstimatedValue += parseFloat(nft.collection.floor_price.value);
      }
    });
  }

  // Process collections
  if (Array.isArray(collections)) {
    summary.totalCollections = collections.length;

    // Get top collections by floor price
    summary.topCollections = collections
      .filter((col) => col.floor_price?.value)
      .sort((a, b) => parseFloat(b.floor_price.value) - parseFloat(a.floor_price.value))
      .slice(0, 5)
      .map((col) => formatCollectionData(col));
  }

  return summary;
};