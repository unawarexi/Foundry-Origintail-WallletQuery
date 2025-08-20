// src/controllers/nfts.controller.js
import NFTService from "../services/nfts.service.js";

class NFTController {
  /**
   * Get all collections from OpenSea
   * GET /api/nfts/collections
   */
  async getAllCollections(req, res) {
    try {
      const { limit, next } = req.query;

      const parsedLimit = limit ? parseInt(limit) : 50;

      // Validate limit range
      if (parsedLimit < 1 || parsedLimit > 200) {
        return res.status(400).json({
          success: false,
          error: "Limit must be between 1 and 200",
        });
      }

      const result = await NFTService.getAllCollections(parsedLimit, next);

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAllCollections controller:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get NFTs owned by an account
   * GET /api/nfts/account/:address
   */
  async getNFTsByAccount(req, res) {
    try {
      const { address } = req.params;
      const { chain, limit, next } = req.query;

      if (!address) {
        return res.status(400).json({
          success: false,
          error: "Account address is required",
        });
      }

      const parsedLimit = limit ? parseInt(limit) : 50;

      // Validate limit range
      if (parsedLimit < 1 || parsedLimit > 200) {
        return res.status(400).json({
          success: false,
          error: "Limit must be between 1 and 200",
        });
      }

      const result = await NFTService.getNFTsByAccount(address, chain || "ethereum", parsedLimit, next);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getNFTsByAccount controller:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get NFTs by collection slug
   * GET /api/nfts/collection/:slug
   */
  async getNFTsByCollection(req, res) {
    try {
      const { slug } = req.params;
      const { limit, next } = req.query;

      if (!slug) {
        return res.status(400).json({
          success: false,
          error: "Collection slug is required",
        });
      }

      const parsedLimit = limit ? parseInt(limit) : 50;

      // Validate limit range
      if (parsedLimit < 1 || parsedLimit > 200) {
        return res.status(400).json({
          success: false,
          error: "Limit must be between 1 and 200",
        });
      }

      const result = await NFTService.getNFTsByCollection(slug, parsedLimit, next);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getNFTsByCollection controller:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get collections owned by an account
   * GET /api/nfts/account/:address/collections
   */
  async getCollectionsByAccount(req, res) {
    try {
      const { address } = req.params;
      const { chain, limit } = req.query;

      if (!address) {
        return res.status(400).json({
          success: false,
          error: "Account address is required",
        });
      }

      const parsedLimit = limit ? parseInt(limit) : 200;

      // Validate limit range
      if (parsedLimit < 1 || parsedLimit > 200) {
        return res.status(400).json({
          success: false,
          error: "Limit must be between 1 and 200",
        });
      }

      const result = await NFTService.getCollectionsByAccount(address, chain || "ethereum", parsedLimit);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getCollectionsByAccount controller:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Get blockchain information for an address
   * GET /api/nfts/address/:address/info
   */
  async getAddressInfo(req, res) {
    try {
      const { address } = req.params;

      if (!address) {
        return res.status(400).json({
          success: false,
          error: "Address is required",
        });
      }

      const result = await NFTService.getAddressInfo(address);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getAddressInfo controller:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * Health check endpoint
   * GET /api/nfts/health
   */
  async healthCheck(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: "NFT API is healthy",
        timestamp: new Date().toISOString(),
        services: {
          opensea: !!process.env.OPENSEA_API_KEY,
          ethereum_provider: true,
        },
      });
    } catch (error) {
      console.error("Error in healthCheck controller:", error);
      return res.status(500).json({
        success: false,
        error: "Health check failed",
      });
    }
  }
}

export default new NFTController();
