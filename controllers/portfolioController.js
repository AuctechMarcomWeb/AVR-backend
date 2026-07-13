import Portfolio from "../models/Portfolio.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";

// CREATE PORTFOLIO
const createPortfolio = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      clientName,
      location,
      duration,
      thumbnailImage,
      bannerImage,
      shortDescription,
      description,
      galleryImages,
      featured,
      activeStatus,
      order,
    } = req.body;

    // 🔹 Required Field Validations
    if (!title?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Title is required"));

    if (!slug?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Slug is required"));

    if (!category?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Category is required"));

    if (!thumbnailImage?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Thumbnail image is required"));

    if (!description?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Description is required"));

    // 🔹 Duplicate Slug Check
    const existingPortfolio = await Portfolio.findOne({
      slug: slug.trim().toLowerCase(),
    });

    if (existingPortfolio) {
      return res
        .status(409)
        .json(
          new apiResponse(
            409,
            null,
            "A portfolio with this slug already exists. Please use a unique slug."
          )
        );
    }

    // 🔹 Create Portfolio
    const portfolio = await Portfolio.create({
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      category: category.trim(),
      clientName: clientName?.trim() || "",
      location: location?.trim() || "",
      duration: duration?.trim() || "",
      thumbnailImage: thumbnailImage.trim(),
      bannerImage: bannerImage?.trim() || "",
      shortDescription: shortDescription?.trim() || "",
      description: description.trim(),
      galleryImages: galleryImages || [],
      featured: featured ?? false,
      activeStatus: activeStatus ?? true,
      order: order ?? 0,
    });

    return res
      .status(201)
      .json(new apiResponse(201, portfolio, "Portfolio created successfully"));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// GET ALL PORTFOLIOS
const getAllPortfolios = asyncHandler(async (req, res) => {
  try {
    const {
      isPagination = "true",
      page = 1,
      limit = 10,
      search,
      category,
      featured,
      activeStatus,
      sortBy = "recent",
    } = req.query;

    const match = {};

    if (activeStatus !== undefined) match.activeStatus = activeStatus === "true";
    if (category) match.category = { $regex: new RegExp(category.trim(), "i") };
    if (featured !== undefined) match.featured = featured === "true";

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      match.$or = [
        { title: { $regex: regex } },
        { slug: { $regex: regex } },
        { category: { $regex: regex } },
        { clientName: { $regex: regex } },
        { location: { $regex: regex } },
      ];
    }

    let pipeline = [{ $match: match }];

    if (sortBy === "recent") {
      pipeline.push({ $sort: { createdAt: -1, _id: -1 } });
    } else if (sortBy === "oldest") {
      pipeline.push({ $sort: { createdAt: 1, _id: 1 } });
    } else if (sortBy === "order") {
      pipeline.push({ $sort: { order: 1, _id: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1, _id: -1 } });
    }

    const totalArr = await Portfolio.aggregate([
      ...pipeline,
      { $count: "count" },
    ]);
    const total = totalArr[0]?.count || 0;

    if (isPagination === "true") {
      pipeline.push(
        { $skip: (page - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      );
    }

    const portfolios = await Portfolio.aggregate(pipeline);

    res.status(200).json(
      new apiResponse(
        200,
        {
          portfolios,
          totalPortfolios: total,
          totalPages: Math.ceil(total / limit),
          currentPage: Number(page),
        },
        "Portfolios fetched successfully"
      )
    );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// GET SINGLE PORTFOLIO BY ID
const getPortfolioById = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid portfolio ID"));
    }

    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Portfolio not found"));
    }

    res
      .status(200)
      .json(new apiResponse(200, portfolio, "Portfolio fetched successfully"));
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// GET SINGLE PORTFOLIO BY SLUG (Public — for frontend)
const getPortfolioBySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;

    const portfolio = await Portfolio.findOne({
      slug: slug.toLowerCase(),
      activeStatus: true,
    });

    if (!portfolio) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Portfolio not found"));
    }

    res
      .status(200)
      .json(new apiResponse(200, portfolio, "Portfolio fetched successfully"));
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// UPDATE PORTFOLIO
const updatePortfolio = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid portfolio ID"));
    }

    // If slug is being updated, check for duplicate
    if (req.body.slug) {
      const duplicate = await Portfolio.findOne({
        slug: req.body.slug.trim().toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (duplicate) {
        return res
          .status(409)
          .json(
            new apiResponse(
              409,
              null,
              "A portfolio with this slug already exists."
            )
          );
      }

      req.body.slug = req.body.slug.trim().toLowerCase();
    }

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPortfolio) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Portfolio not found"));
    }

    res
      .status(200)
      .json(
        new apiResponse(200, updatedPortfolio, "Portfolio updated successfully")
      );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// DELETE PORTFOLIO
const deletePortfolio = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid portfolio ID"));
    }

    const deletedPortfolio = await Portfolio.findByIdAndDelete(req.params.id);

    if (!deletedPortfolio) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Portfolio not found"));
    }

    res
      .status(200)
      .json(
        new apiResponse(200, deletedPortfolio, "Portfolio deleted successfully")
      );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

export {
  createPortfolio,
  getAllPortfolios,
  getPortfolioById,
  getPortfolioBySlug,
  updatePortfolio,
  deletePortfolio,
};
