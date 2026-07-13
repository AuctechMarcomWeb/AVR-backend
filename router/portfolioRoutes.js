import { Router } from "express";
import {
  createPortfolio,
  getAllPortfolios,
  getPortfolioById,
  getPortfolioBySlug,
  updatePortfolio,
  deletePortfolio,
} from "../controllers/portfolioController.js";

import { verifyJWT } from "../middlewares/authTypeMiddleware.js";

const router = Router();

// ✅ Public Routes (Frontend)
router.get("/", getAllPortfolios);
router.get("/slug/:slug", getPortfolioBySlug); // by slug — must be before /:id
router.get("/:id", getPortfolioById);          // by MongoDB ID

// ✅ Admin Routes (Protected)
router.post("/", verifyJWT, createPortfolio);
router.put("/:id", verifyJWT, updatePortfolio);
router.delete("/:id", verifyJWT, deletePortfolio);

export default router;
