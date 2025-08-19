import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import NotAvailable from "./core/errors/NotAvailable";
import TransactionsTable from "./pages/TransactionsTable";
import NftCollections from "./pages/NftCollections";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* All routes should be defined here, wrapped in MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="balance" element={<NotAvailable />} />
          <Route path="transactions" element={<TransactionsTable />} />
          <Route path="nftcards" element={<NftCollections />} />
          <Route path="settings" element={<NotAvailable />} />
          <Route path="*" element={<NotAvailable />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
