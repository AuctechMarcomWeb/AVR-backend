import { Router } from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogByUrl,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import { verifyJWT } from "../middlewares/authTypeMiddleware.js";
const router = Router();

router.get("/", getAllBlogs);
router.get("/url/:url", getBlogByUrl);
router.get("/:id", getBlogById);

router.post("/", verifyJWT, createBlog);
router.put("/:id", verifyJWT, updateBlog);
router.delete("/:id", verifyJWT, deleteBlog);

export default router;