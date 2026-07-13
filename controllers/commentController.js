import Comment from "../models/Comment.modal.js";
import Blog from "../models/Blog.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";

// CREATE COMMENT
const createComment = asyncHandler(async (req, res) => {
  const { blogId, name, email, message } = req.body;

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid Blog ID"));
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "All fields are required"));
  }

  // check blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json(new apiResponse(404, null, "Blog not found"));
  }

  const comment = await Comment.create({
    blogId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
  });

  return res
    .status(201)
    .json(new apiResponse(201, comment, "Comment added successfully"));
});

const getAllComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const match = {};

  // optional search (name/email/message)
  if (search) {
    match.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  const totalComments = await Comment.countDocuments(match);

  const comments = await Comment.find(match)
    .populate("blogId", "heading seoTitle url")
    .sort({ createdAt: -1 })
    .skip((page - 1) * Number(limit))
    .limit(Number(limit));

  return res.status(200).json(
    new apiResponse(
      200,
      {
        comments,
        totalComments,
        currentPage: Number(page),
        totalPages: Math.ceil(totalComments / limit),
      },
      "All comments fetched successfully",
    ),
  );
});

const getCommentsByBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(blogId)) {
    return res.status(400).json(new apiResponse(400, null, "Invalid Blog ID"));
  }

  const comments = await Comment.find({ blogId, isActive: true }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new apiResponse(200, comments, "Comments fetched successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await Comment.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updated) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Comment not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, updated, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid Comment ID"));
  }

  const deleted = await Comment.findByIdAndDelete(id);

  if (!deleted) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Comment not found"));
  }

  return res
    .status(200)
    .json(new apiResponse(200, deleted, "Comment deleted successfully"));
});


export { createComment, getAllComments, getCommentsByBlog, updateComment, deleteComment };
