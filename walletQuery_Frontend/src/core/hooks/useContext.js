import { useContext } from "react";
import { BlockchainContext } from "../../context/EthContext.jsx";
import { NFTContext } from "../../context/NftContext.jsx";

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error("useBlockchain must be used within a BlockchainProvider");
  }
  return context;
};


export const useNFT = () => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error("useNFT must be used within an NFTProvider");
  }
  return context;
};