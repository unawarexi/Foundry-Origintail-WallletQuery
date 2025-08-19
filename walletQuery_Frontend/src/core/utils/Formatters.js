export const formatAddress = (address) => {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatHash = (hash) => {
  if (!hash) return "N/A";
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

export const formatValue = (value, tokenSymbol) => {
  if (!value) return "0";
  const numValue = parseFloat(value);
  if (numValue < 0.000001) return "< 0.000001";
  return numValue.toFixed(6);
};

export const formatAge = (timestamp) => {
  if (!timestamp) return "";
  const now = Date.now();
  const txTime = typeof timestamp === "number" ? timestamp * 1000 : new Date(timestamp).getTime();
  const diff = now - txTime;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} days ago`;
  if (hours > 0) return `${hours} hrs ago`;
  return `${minutes} mins ago`;
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 30) return `${days} days ago`;
  return date.toLocaleDateString();
};
