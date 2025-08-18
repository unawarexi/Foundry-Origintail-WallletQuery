
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";




const App = () => {
  return (
    <Router>
      
      <Routes>
        {/* Main layout wraps all routes */}

        <Route path="/" element={<MainLayout />}>
        {/* <Route path="/transactions" element={<Transactions />} />
        <Route path="/balance" element={<Balance />} />
        <Route path="/tokens" element={<Tokens />} /> */}
        </Route>
      </Routes>
    </Router>
  );
};



export default App;
