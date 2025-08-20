
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import ethRoutes from "./routes/eth.routes.js";
import nftRoutes from "./routes/nfts.routes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", ethRoutes);
app.use("/api/nfts", nftRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Wallet Query API is running' });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 API endpoints available at:`);
  console.log(`   GET  http://localhost:${PORT}/api/transactions?address=0x...&fromBlock=123`);
  console.log(`   GET  http://localhost:${PORT}/api/transactions/balance?address=0x...&date=2024-01-01`);
  console.log(`   GET  http://localhost:${PORT}/api/transactions/tokens?address=0x...&fromBlock=123`);
  console.log(`   GET  http://localhost:${PORT}/api/transactions/token-balance?address=0x...&token=0x...&date=2024-01-01`);
});

export default app;
