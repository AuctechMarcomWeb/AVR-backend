import { Router } from "express";
import {
  createBookConsultation,
  getAllBookConsultations,
  getBookConsultationById,
  updateBookConsultation,
  deleteBookConsultation,
} from "../controllers/bookConsultationController.js";

import { verifyJWT } from "../middlewares/authTypeMiddleware.js";

const router = Router();

// ✅ Public (Frontend Booking Form)
router.post("/", createBookConsultation);

// ✅ Admin Routes (Protected)
router.get("/", verifyJWT, getAllBookConsultations);
router.get("/:id", verifyJWT, getBookConsultationById);
router.put("/:id", verifyJWT, updateBookConsultation);
router.delete("/:id", verifyJWT, deleteBookConsultation);

export default router;
