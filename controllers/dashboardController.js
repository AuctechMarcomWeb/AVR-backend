import Blog from "../models/Blog.modal.js";
import Testimonials from "../models/Testimonials.modal.js";
import HomeSlider from "../models/HomeSlider.modal.js";
import Gallery from "../models/Gallery.modal.js";
import ContactPage from "../models/ContactPage.modal.js";

import { asyncHandler } from "../utils/asynchandler.js";
import { apiResponse } from "../utils/apiResponse.js";

// 🔹 GET CONTENT DASHBOARD STATS
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // 📝 Blogs Stats
    const totalBlogs = await Blog.countDocuments();
    const activeBlogs = await Blog.countDocuments({ isActive: true });

    // ⭐ Testimonials Stats
    const totalTestimonials = await Testimonials.countDocuments();
    const activeTestimonials = await Testimonials.countDocuments({ isActive: true });

    // 🖼️ Home Slider Stats
    const totalSliders = await HomeSlider.countDocuments();
    const activeSliders = await HomeSlider.countDocuments({ isActive: true });

    // 🖼️ Gallery Stats
    const totalGalleryItems = await Gallery.countDocuments();
    const activeGalleryItems = await Gallery.countDocuments({ isActive: true });

    // 📩 Contact Page / Enquiry Stats
    const totalContacts = await ContactPage.countDocuments();
    // const unreadContacts = await ContactPage.countDocuments({ isRead: false });

    // // 🔹 Recent Records (Optional – Dashboard UI ke liye)
    // const recentBlogs = await Blog.find()
    //   .sort({ createdAt: -1 })
    //   .limit(5)
    //   .select("title category isActive createdAt");

    // const recentTestimonials = await Testimonials.find()
    //   .sort({ createdAt: -1 })
    //   .limit(5)
    //   .select("title rating isActive createdAt");

    // const recentContacts = await ContactPage.find()
    //   .sort({ createdAt: -1 })
    //   .limit(5)
    //   .select("name email subject isRead createdAt");

    res.status(200).json(
      new apiResponse(
        200,
        {
          blogs: {
            totalBlogs,
            activeBlogs,
          },
          testimonials: {
            totalTestimonials,
            activeTestimonials,
          },
          homeSliders: {
            totalSliders,
            activeSliders,
          },
          gallery: {
            totalGalleryItems,
            activeGalleryItems,
          },
          contacts: {
            totalContacts,
            // unreadContacts,
          },
        //   recentData: {
        //     recentBlogs,
        //     recentTestimonials,
        //     recentContacts,
        //   },
        },
        "Dashboard Fetched Successfully"
      )
    );
  } catch (error) {
    res
      .status(500)
      .json(new apiResponse(500, null, `Error: ${error.message}`));
  }
});
