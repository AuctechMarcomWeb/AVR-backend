import mongoose from "mongoose";
import Blog from "../models/Blog.modal.js";
import Comment from "../models/Comment.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

/**
 * User search input ko safe regex banane ke liye.
 */
const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * CREATE BLOG
 */
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
      tags,
    } = req.body;

    if (!seoTitle?.trim()) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "SEO Title is required"));
    }

    const normalizedUrl = url?.trim();
    const normalizedSeoTitle = seoTitle.trim();

    // URL aur SEO title duplicate check
    const duplicateConditions = [
      {
        seoTitle: normalizedSeoTitle,
      },
    ];

    if (normalizedUrl) {
      duplicateConditions.push({
        url: normalizedUrl,
      });
    }

    const existingBlog = await Blog.findOne({
      $or: duplicateConditions,
    });

    if (existingBlog) {
      const duplicateField =
        normalizedUrl && existingBlog.url === normalizedUrl
          ? "URL"
          : "SEO Title";

      return res
        .status(409)
        .json(
          new apiResponse(
            409,
            null,
            `Blog with this ${duplicateField} already exists`
          )
        );
    }

    const blog = await Blog.create({
      url: normalizedUrl || undefined,
      heading: heading?.trim(),
      seoTitle: normalizedSeoTitle,
      metaKeywords: metaKeywords?.trim(),
      shortDescription: shortDescription?.trim(),
      mainImage: mainImage?.trim(),
      multipleImages: Array.isArray(multipleImages)
        ? multipleImages.filter(Boolean)
        : [],
      mainImageName: mainImageName?.trim(),
      details,
      isActive: isActive ?? true,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    });

    return res
      .status(201)
      .json(new apiResponse(201, blog, "Blog created successfully"));
  } catch (error) {
    // MongoDB unique index duplicate error
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return res
        .status(409)
        .json(
          new apiResponse(
            409,
            null,
            `Blog with this ${duplicateField} already exists`
          )
        );
    }

    return res
      .status(500)
      .json(new apiResponse(500, null, error.message));
  }
});

/**
 * GET ALL BLOGS
 *
 * Example:
 * /api/blogs?page=1&limit=10
 * /api/blogs?search=vastu
 * /api/blogs?isActive=true
 * /api/blogs?sortBy=oldest
 * /api/blogs?isPagination=false
 */
const getAllBlogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    isActive,
    sortBy = "recent",
    isPagination = "true",
  } = req.query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const paginationEnabled = isPagination === "true";

  const match = {};

  // Active/inactive filter
  if (isActive !== undefined) {
    match.isActive = isActive === "true";
  }

  // Search filter
  if (search.trim()) {
    const searchRegex = new RegExp(
      escapeRegex(search.trim()),
      "i"
    );

    match.$or = [
      {
        heading: searchRegex,
      },
      {
        seoTitle: searchRegex,
      },
      {
        shortDescription: searchRegex,
      },
      {
        metaKeywords: searchRegex,
      },
      {
        url: searchRegex,
      },
    ];
  }

  const totalBlogs = await Blog.countDocuments(match);

  const totalPages = paginationEnabled
    ? Math.ceil(totalBlogs / limitNumber)
    : totalBlogs > 0
      ? 1
      : 0;

  const sortOrder = sortBy === "oldest" ? 1 : -1;

  const pipeline = [
    {
      $match: match,
    },

    {
      $sort: {
        createdAt: sortOrder,
      },
    },
  ];

  // Apply pagination before lookup for better performance
  if (paginationEnabled) {
    pipeline.push(
      {
        $skip: (pageNumber - 1) * limitNumber,
      },
      {
        $limit: limitNumber,
      }
    );
  }

  pipeline.push(
    {
      $lookup: {
        from: "comments",
        let: {
          currentBlogId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$blogId", "$$currentBlogId"],
                  },
                  {
                    $eq: ["$isActive", true],
                  },
                ],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "commentStats",
      },
    },

    {
      $addFields: {
        commentCount: {
          $ifNull: [
            {
              $arrayElemAt: ["$commentStats.count", 0],
            },
            0,
          ],
        },
      },
    },

    {
      $project: {
        commentStats: 0,
      },
    }
  );

  const blogs = await Blog.aggregate(pipeline);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        blogs,
        totalBlogs,
        totalPages,
        currentPage: paginationEnabled ? pageNumber : 1,
        limit: paginationEnabled ? limitNumber : totalBlogs,
        isPagination: paginationEnabled,
      },
      "Blogs fetched successfully"
    )
  );
});

/**
 * GET SINGLE BLOG BY ID
 */
const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid Blog ID"));
  }

  const blog = await Blog.findById(id);

  if (!blog) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Blog not found"));
  }

  const comments = await Comment.find({
    blogId: blog._id,
    isActive: true,
  }).sort({
    createdAt: -1,
  });

  return res.status(200).json(
    new apiResponse(
      200,
      {
        blog,
        comments,
        commentCount: comments.length,
      },
      "Blog fetched successfully"
    )
  );
});

/**
 * GET SINGLE BLOG BY URL/SLUG
 *
 * Example:
 * /api/blogs/url/vastu-tips-for-modern-homes
 */
const getBlogByUrl = asyncHandler(async (req, res) => {
  const blogUrl = req.params.url?.trim();

  if (!blogUrl) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Blog URL is required"));
  }

  const blog = await Blog.findOne({
    url: blogUrl,
    isActive: true,
  });

  if (!blog) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Blog not found"));
  }

  const comments = await Comment.find({
    blogId: blog._id,
    isActive: true,
  }).sort({
    createdAt: -1,
  });

  return res.status(200).json(
    new apiResponse(
      200,
      {
        blog,
        comments,
        commentCount: comments.length,
      },
      "Blog fetched successfully"
    )
  );
});

/**
 * UPDATE BLOG
 */
const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid Blog ID"));
    }

    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Blog not found"));
    }

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
      tags,
    } = req.body;

    const normalizedUrl =
      url !== undefined ? url?.trim() : existingBlog.url;

    const normalizedSeoTitle =
      seoTitle !== undefined
        ? seoTitle?.trim()
        : existingBlog.seoTitle;

    if (!normalizedSeoTitle) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "SEO Title is required"));
    }

    const duplicateConditions = [
      {
        seoTitle: normalizedSeoTitle,
      },
    ];

    if (normalizedUrl) {
      duplicateConditions.push({
        url: normalizedUrl,
      });
    }

    const duplicateBlog = await Blog.findOne({
      _id: {
        $ne: id,
      },
      $or: duplicateConditions,
    });

    if (duplicateBlog) {
      const duplicateField =
        normalizedUrl && duplicateBlog.url === normalizedUrl
          ? "URL"
          : "SEO Title";

      return res
        .status(409)
        .json(
          new apiResponse(
            409,
            null,
            `Blog with this ${duplicateField} already exists`
          )
        );
    }

    const updateOperation = {
      $set: {},
    };

    // Only provided fields update honge
    if (heading !== undefined) {
      updateOperation.$set.heading = heading?.trim();
    }

    if (seoTitle !== undefined) {
      updateOperation.$set.seoTitle = normalizedSeoTitle;
    }

    if (metaKeywords !== undefined) {
      updateOperation.$set.metaKeywords =
        metaKeywords?.trim();
    }

    if (shortDescription !== undefined) {
      updateOperation.$set.shortDescription =
        shortDescription?.trim();
    }

    if (mainImage !== undefined) {
      updateOperation.$set.mainImage = mainImage?.trim();
    }

    if (multipleImages !== undefined) {
      updateOperation.$set.multipleImages = Array.isArray(
        multipleImages
      )
        ? multipleImages.filter(Boolean)
        : [];
    }

    if (mainImageName !== undefined) {
      updateOperation.$set.mainImageName =
        mainImageName?.trim();
    }

    if (details !== undefined) {
      updateOperation.$set.details = details;
    }

    if (isActive !== undefined) {
      updateOperation.$set.isActive = isActive;
    }

    if (tags !== undefined) {
      updateOperation.$set.tags = Array.isArray(tags) ? tags.filter(Boolean) : [];
    }

    // Empty URL aaye to database se remove kar do
    if (url !== undefined) {
      if (normalizedUrl) {
        updateOperation.$set.url = normalizedUrl;
      } else {
        updateOperation.$unset = {
          url: "",
        };
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateOperation,
      {
        new: true,
        runValidators: true,
      }
    );

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          updatedBlog,
          "Blog updated successfully"
        )
      );
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(
        error.keyPattern || {}
      )[0];

      return res
        .status(409)
        .json(
          new apiResponse(
            409,
            null,
            `Blog with this ${duplicateField} already exists`
          )
        );
    }

    return res
      .status(500)
      .json(new apiResponse(500, null, error.message));
  }
});

/**
 * DELETE BLOG
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new apiResponse(400, null, "Invalid Blog ID"));
  }

  const deletedBlog = await Blog.findByIdAndDelete(id);

  if (!deletedBlog) {
    return res
      .status(404)
      .json(new apiResponse(404, null, "Blog not found"));
  }

  // Blog ke related comments bhi delete honge
  await Comment.deleteMany({
    blogId: deletedBlog._id,
  });

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        deletedBlog,
        "Blog deleted successfully"
      )
    );
});

export {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogByUrl,
  updateBlog,
  deleteBlog,
};