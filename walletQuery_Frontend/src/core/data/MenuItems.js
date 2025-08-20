import { Wallet, Activity, CreditCard, Home, Settings } from "lucide-react";
export const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    route: "/dashboard",
    description: "Overview",
  },
  {
    id: "special tokens",
    label: "Special Tokens",
    icon: Wallet,
    route: "/special-tokens",
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
    id: "nfts",
    label: "Nft Collections",
    icon: CreditCard,
    route: "/nftcards",
    description: "Manage Nft collections",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    route: "/settings",
    description: "App settings",
  },
];

export const filterOptions = {
  date: [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ],
  type: [
    { value: "all", label: "All Types" },
    { value: "send", label: "Send" },
    { value: "receive", label: "Receive" },
    { value: "swap", label: "Swap" },
  ],
};
