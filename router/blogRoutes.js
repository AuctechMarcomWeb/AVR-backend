import { Router } from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

import { verifyJWT } from "../middlewares/authTypeMiddleware.js";

const router = Router();

// ✅ Public Routes
router.get("/", getAllBlogs); // Get all blogs for frontend
router.get("/:id", getBlogById); // Get single blog by ID

// ✅ Admin Routes (Protected)
router.post("/", verifyJWT, createBlog); // Create a new blog
router.put("/:id", verifyJWT, updateBlog); // Update a blog
router.delete("/:id", verifyJWT, deleteBlog); // Delete a blog

export default router;
