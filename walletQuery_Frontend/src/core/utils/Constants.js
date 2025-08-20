import { Activity, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export const getTransactionIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "send":
      return ArrowUpRight;
    case "receive":
      return ArrowDownLeft;
    case "swap":
      return Activity;
    default:
      return Activity;
  }
};
