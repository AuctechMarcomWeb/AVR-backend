import { Router } from "express";
import {
  createContactPage,
  getAllContactPages,
  getContactPageById,
  updateContactPage,
  deleteContactPage,
} from "../controllers/contactPageController.js";

import { verifyJWT } from "../middlewares/authTypeMiddleware.js";

const router = Router();

// ✅ Public (Frontend Contact Form)
router.post("/", createContactPage);

// ✅ Admin Routes
router.get("/", verifyJWT, getAllContactPages);
router.get("/:id", verifyJWT, getContactPageById);
router.put("/:id", verifyJWT, updateContactPage);
router.delete("/:id", verifyJWT, deleteContactPage);

export default router;
