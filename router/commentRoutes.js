import { Router } from "express";
import {
  createComment,
  getAllComments,
  getCommentsByBlog,
  deleteComment,
  updateComment,
} from "../controllers/commentController.js";
import { verifyJWT } from "../middlewares/authTypeMiddleware.js";

const router = Router();
// ========================
// ✅ COMMENT ROUTES
// ========================

// Public
router.post("/", createComment);
router.get("/", getAllComments);
router.get("/blog/:blogId", getCommentsByBlog);

// Admin (optional)
router.delete("/:id", verifyJWT, deleteComment);
router.put("/:id", verifyJWT, updateComment);

export default router;
