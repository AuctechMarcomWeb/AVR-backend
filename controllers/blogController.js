import Blog from "../models/Blog.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";
import Comment from "../models/Comment.modal.js";
// CREATE Blog
const createBlog = asyncHandler(async (req, res) => {
  try {
    const {
      url,
      heading,
      seoTitle,
      metaKeywords,
      shortDescription,
      mainImage,
      multipleImages,
      mainImageName,
      details,
      isActive,
    } = req.body;

    // 🔹 Required validation (example)
    if (!seoTitle?.trim()) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "SEO Title is required"));
    }

    // 🔥 DUPLICATE CHECK (best: url OR seoTitle)
    const existingBlog = await Blog.findOne({
      $or: [{ url: url?.trim() }, { seoTitle: seoTitle?.trim() }],
    });

    if (existingBlog) {
      return res
        .status(409)
        .json(new apiResponse(409, null, "Blog already exists"));
    }

    // 🔹 Create Blog
    const blog = await Blog.create({
      url: url?.trim(),
      heading: heading?.trim(),
      seoTitle: seoTitle?.trim(),
      metaKeywords: metaKeywords?.trim(),
      shortDescription: shortDescription?.trim(),
      mainImage,
      multipleImages: multipleImages || [],
      mainImageName,
      details,
      isActive: isActive ?? true,
    });

    return res
      .status(201)
      .json(new apiResponse(201, blog, "Blog created successfully"));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, null, error.message));
  }
});


// GET ALL Blogs
const getAllBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive, sortBy = "recent", isPagination = "true" } = req.query;

  const match = {};
  if (isActive !== undefined) match.isActive = isActive === "true";
  if (search) match.heading = { $regex: new RegExp(search.trim(), "i") };

  let pipeline = [{ $match: match }];
  if (sortBy === "recent") pipeline.push({ $sort: { createdAt: -1 } });
  else if (sortBy === "oldest") pipeline.push({ $sort: { createdAt: 1 } });

  const totalArr = await Blog.aggregate([...pipeline, { $count: "count" }]);
  const totalBlogs = totalArr[0]?.count || 0;
  const totalPages = Math.ceil(totalBlogs / limit);

  if (isPagination === "true") {
    pipeline.push({ $skip: (page - 1) * Number(limit) }, { $limit: Number(limit) });
  }

const blogs = await Blog.aggregate([
  { $match: match },

  {
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "blogId",
      as: "comments",
    },
  },

  {
    $addFields: {
      commentCount: { $size: "$comments" },
    },
  },

  {
    $project: {
      comments: 0, // hide full comments list
    },
  },

  { $sort: { createdAt: -1 } },
]);

  res.status(200).json(new apiResponse(200, { blogs, totalBlogs, totalPages, currentPage: Number(page) }, "Blogs fetched successfully"));
});

// GET SINGLE Blog
const getBlogById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json(new apiResponse(400, null, "Invalid Blog ID"));

  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json(new apiResponse(404, null, "Blog not found"));

   // 🔥 Get comments
  const comments = await Comment.find({
    blogId: blog._id,
    isActive: true,
  }).sort({ createdAt: -1 });

  // 🔥 Final response (blog + comments + count)
  return res.status(200).json(
    new apiResponse(
      200,
      {
        blog,
        comments,
        commentCount: comments.length,
      },
      "Blog fetched successfully"
    ));
});

// UPDATE Blog
const updateBlog = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json(new apiResponse(400, null, "Invalid Blog ID"));

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updatedBlog) return res.status(404).json(new apiResponse(404, null, "Blog not found"));

  res.status(200).json(new apiResponse(200, updatedBlog, "Blog updated successfully"));
});

// DELETE Blog
const deleteBlog = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json(new apiResponse(400, null, "Invalid Blog ID"));

  const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
  if (!deletedBlog) return res.status(404).json(new apiResponse(404, null, "Blog not found"));

  res.status(200).json(new apiResponse(200, deletedBlog, "Blog deleted successfully"));
});

export { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog };
