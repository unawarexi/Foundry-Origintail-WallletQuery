// src/routes/nfts.routes.js
import express from "express";
import NFTController from "../controllers/nfts.controller.js";

const router = express.Router();
router.get("/health", NFTController.healthCheck);

// Get all collections from OpenSea (this... actual implementation may vary, we pinned to search per user address)
// GET /api/nfts/collections?limit=50&next=cursor
router.get("/collections", NFTController.getAllCollections);

// Get NFTs owned by account address
// GET /api/nfts/account/:address?chain=ethereum&limit=50&next=cursor
router.get("/account/:address", NFTController.getNFTsByAccount);

// Get collections owned by account address (we used this instead of getAllCollections to avoid large payloads)
// GET /api/nfts/account/:address/collections?chain=ethereum&limit=200
router.get("/account/:address/collections", NFTController.getCollectionsByAccount);

// Get NFTs by collection slug
// GET /api/nfts/collection/:slug?limit=50&next=cursor
router.get("/collection/:slug", NFTController.getNFTsByCollection);

// Get blockchain info for an address
// GET /api/nfts/address/:address/info
router.get("/address/:address/info", NFTController.getAddressInfo);

// Error middleware used for NFT routes
router.use((error, req, res, next) => {
  console.error("NFT Route Error:", error);

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON in request body",
    });
  }

  return res.status(500).json({
    success: false,
    error: "Internal server error in NFT API",
  });
});

export default router;
