import { BlockchainProvider } from "./EthContext.jsx";
import { NFTProvider } from "./NftContext.jsx";
export const AppProviders = ({ children }) => (
  <BlockchainProvider>
    <NFTProvider>{children}</NFTProvider>
  </BlockchainProvider>
);
