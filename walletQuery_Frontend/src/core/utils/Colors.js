export const getTransactionColor = (type) => {
  switch (type?.toLowerCase()) {
    case "send":
      return "text-red-400";
    case "receive":
      return "text-green-400";
    case "swap":
      return "text-blue-400";
    default:
      return "text-blue-400";
  }
};

export const getTransactionBg = (type) => {
  switch (type?.toLowerCase()) {
    case "send":
      return "bg-red-500 bg-opacity-20";
    case "receive":
      return "bg-green-500 bg-opacity-20";
    case "swap":
      return "bg-blue-500 bg-opacity-20";
    default:
      return "bg-blue-500 bg-opacity-20";
  }
};
