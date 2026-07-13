import Blog from "../models/Blog.modal.js";
import BookConsultation from "../models/BookConsultation.modal.js";
import Comment from "../models/Comment.modal.js";
import ContactPage from "../models/ContactPage.modal.js";
import Gallery from "../models/Gallery.modal.js";
import HomeSlider from "../models/HomeSlider.modal.js";
import Portfolio from "../models/Portfolio.modal.js";
import Testimonials from "../models/Testimonials.modal.js";
import User from "../models/User.modal.js";

import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

// GET /api/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Sirf Admin ke liye
    // if (!req.user) {
    //   return res
    //     .status(401)
    //     .json(new apiResponse(401, null, "Authentication required"));
    // }

    // if (req.user.role !== "Admin") {
    //   return res
    //     .status(403)
    //     .json(new apiResponse(403, null, "Admin access required"));
    // }

    const [
      // Users
      // totalUsers,
      // activeUsers,
      // inactiveUsers,

      // Blogs
      totalBlogs,
      activeBlogs,
      inactiveBlogs,

      // Portfolios
      totalPortfolios,
      activePortfolios,
      inactivePortfolios,

      // Comments
      // totalComments,
      // activeComments,
      // inactiveComments,

      // Gallery
      totalGallery,
      activeGallery,
      inactiveGallery,

      // Sliders
      totalSliders,
      activeSliders,
      inactiveSliders,

      // Testimonials
      // totalTestimonials,
      // activeTestimonials,
      // inactiveTestimonials,

      // Consultations
      totalConsultations,
      readConsultations,
      unreadConsultations,

      // Contacts
      totalContacts,
      readContacts,
      unreadContacts,

      // Recent unread data
      recentUnreadConsultations,
      recentUnreadContacts,
    ] = await Promise.all([
      // =========================
      // USERS
      // =========================
      // User.countDocuments(),
      // User.countDocuments({ activeStatus: true }),
      // User.countDocuments({ activeStatus: false }),

      // =========================
      // BLOGS
      // =========================
      Blog.countDocuments(),
      Blog.countDocuments({ isActive: true }),
      Blog.countDocuments({ isActive: false }),

      // =========================
      // PORTFOLIOS
      // =========================
      Portfolio.countDocuments(),
      Portfolio.countDocuments({ activeStatus: true }),
      Portfolio.countDocuments({ activeStatus: false }),

      // =========================
      // COMMENTS
      // =========================
      // Comment.countDocuments(),
      // Comment.countDocuments({ isActive: true }),
      // Comment.countDocuments({ isActive: false }),

      // =========================
      // GALLERY
      // =========================
      Gallery.countDocuments(),
      Gallery.countDocuments({ isActive: true }),
      Gallery.countDocuments({ isActive: false }),

      // =========================
      // HOME SLIDERS
      // =========================
      HomeSlider.countDocuments(),
      HomeSlider.countDocuments({ isActive: true }),
      HomeSlider.countDocuments({ isActive: false }),

      // =========================
      // TESTIMONIALS
      // =========================
      // Testimonials.countDocuments(),
      // Testimonials.countDocuments({ isActive: true }),
      // Testimonials.countDocuments({ isActive: false }),

      // =========================
      // CONSULTATIONS
      // =========================
      BookConsultation.countDocuments(),
      BookConsultation.countDocuments({ isRead: true }),

      // $ne true se old records bhi unread mein count honge
      BookConsultation.countDocuments({
        isRead: { $ne: true },
      }),

      // =========================
      // CONTACTS
      // =========================
      ContactPage.countDocuments(),
      ContactPage.countDocuments({ isRead: true }),

      ContactPage.countDocuments({
        isRead: { $ne: true },
      }),

      // =========================
      // RECENT UNREAD CONSULTATIONS
      // =========================
      BookConsultation.find({
        isRead: { $ne: true },
      })
        .select(
          "name email phone date slot address remarks status isRead createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // =========================
      // RECENT UNREAD CONTACTS
      // =========================
      ContactPage.find({
        isRead: { $ne: true },
      })
        .select("name email phone subject message isRead createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const dashboardData = {
      counts: {
        // users: {
        //   total: totalUsers,
        //   active: activeUsers,
        //   inactive: inactiveUsers,
        // },

        blogs: {
          total: totalBlogs,
          active: activeBlogs,
          inactive: inactiveBlogs,
        },

        portfolios: {
          total: totalPortfolios,
          active: activePortfolios,
          inactive: inactivePortfolios,
        },

      
        gallery: {
          total: totalGallery,
          active: activeGallery,
          inactive: inactiveGallery,
        },

        sliders: {
          total: totalSliders,
          active: activeSliders,
          inactive: inactiveSliders,
        },

        // testimonials: {
        //   total: totalTestimonials,
        //   active: activeTestimonials,
        //   inactive: inactiveTestimonials,
        // },

        consultations: {
          total: totalConsultations,
          read: readConsultations,
          unread: unreadConsultations,
        },

        contacts: {
          total: totalContacts,
          read: readContacts,
          unread: unreadContacts,
        },
      },

      recent: {
        unreadConsultations: recentUnreadConsultations,
        unreadContacts: recentUnreadContacts,
      },
    };

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          dashboardData,
          "Dashboard data fetched successfully"
        )
      );
  } catch (error) {
    console.error("Dashboard controller error:", error);

    return res
      .status(500)
      .json(
        new apiResponse(
          500,
          null,
          error.message || "Failed to fetch dashboard data"
        )
      );
  }
});

export { getDashboardStats };