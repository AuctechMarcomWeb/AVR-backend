import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./router/authRoutes.js";
import uploadRoutes from "./router/uploadRoutes.js";
import galleryRoutes from "./router/galleryRoutes.js";
import contactPageRoutes from "./router/contactPageRoutes.js";
import testimonialsRoutes from "./router/testimonialsRoutes.js";
import homeSliderRoutes from "./router/homeSliderRoutes.js";
import blogRoutes from "./router/blogRoutes.js";
import dashboardRoutes from "./router/dashboardRoutes.js";
import commentRoutes from "./router/commentRoutes.js";
import bookConsultationRoutes from "./router/bookConsultationRoutes.js";
import portfolioRoutes from "./router/portfolioRoutes.js";
import { generalLimiter, authLimiter } from "./middlewares/rateLimiter.js";
// Load environment variables
dotenv.config();
const app = express();

// CORS Configuration
const clientUrl = process.env.CLIENT_URL;
app.use(
  cors({
    // origin: clientUrl || "*",
    origin: clientUrl || "http://localhost:5173",
    credentials: true,
  }),
);

// app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Rate Limiters
// app.use("/api/auth", authLimiter);   // strict — OTP/login routes
// app.use("/api", generalLimiter);     // general — baaki sab routes

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contact", contactPageRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/homeSlider", homeSliderRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/bookConslution", bookConsultationRoutes);
app.use("/api/portfolio", portfolioRoutes);

const PORT = process.env.PORT || 5000;
// Start the server and connect to the database
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});
