import createError from "http-errors";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import transactionsRoutes from "./routes/transactions.routes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

app.use("/api", transactionsRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Wallet Query API is running' });
});


// error handler
// app.use((err, req, res, next) => {
//   console.error("Global error handler:", err);

//   res.status(err.status || 500).json({
//     error: "Internal Server Error",
//     message: err.message || "Something went wrong",
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
//   });
// });

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
