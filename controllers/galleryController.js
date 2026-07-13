import Gallery from "../models/Gallery.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";

// CREATE GALLERY ITEM
const createGallery = asyncHandler(async (req, res) => {
  try {
    const { title, url, isActive, serviceType } = req.body;

    if (!url || url.trim() === "") {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Image URL is required to create a gallery item"));
    }

    const existing = await Gallery.findOne({ url: url.trim() });
    if (existing) {
      return res
        .status(409)
        .json(new apiResponse(409, null, "A gallery item with this image URL already exists. Please upload a different image"));
    }

    const gallery = await Gallery.create({
      title: title?.trim() || "",
      url: url.trim(),
      serviceType: serviceType || undefined,
      isActive: isActive !== undefined ? isActive : true,
    });

    res
      .status(201)
      .json(new apiResponse(201, gallery, "Gallery item added successfully"));
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, `Failed to create gallery item: ${error.message}`));
  }
});


// GET ALL GALLERY ITEMS (with pagination + search)
const getAllGallery = asyncHandler(async (req, res) => {
  try {
    const {
      isPagination = "true",
      page = 1,
      limit = 10,
      search,
      isActive,
      serviceType,
      sortBy = "recent",
    } = req.query;

    const match = {};

    if (isActive !== undefined) match.isActive = isActive === "true";
    if (serviceType) match.serviceType = serviceType;

    let pipeline = [{ $match: match }];

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      pipeline.push({ $match: { title: { $regex: regex } } });
    }

    if (sortBy === "recent") {
      pipeline.push({ $sort: { createdAt: -1 } });
    } else if (sortBy === "oldest") {
      pipeline.push({ $sort: { createdAt: 1 } });
    }

    const totalArr = await Gallery.aggregate([
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

    const gallery = await Gallery.aggregate(pipeline);

    res.status(200).json(
      new apiResponse(
        200,
        {
          gallery,
          totalGallery: total,
          totalPages: Math.ceil(total / limit),
          currentPage: Number(page),
        },
        "Gallery items fetched successfully"
      )
    );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});


//  GET SINGLE GALLERY ITEM
const getGalleryById = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid gallery ID"));
    }

    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Gallery item not found"));
    }

    res
      .status(200)
      .json(new apiResponse(200, gallery, "Gallery item fetched successfully"));
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, `Error: ${error.message}`));
  }
});

//  UPDATE GALLERY ITEM
const updateGallery = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid gallery ID"));
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedGallery) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Gallery item not found"));
    }

    res
      .status(200)
      .json(new apiResponse(200, updatedGallery, "Gallery updated successfully"));
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, `Error: ${error.message}`));
  }
});

// DELETE GALLERY ITEM
const deleteGallery = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid gallery ID"));
    }

    const deletedGallery = await Gallery.findByIdAndDelete(req.params.id);

    if (!deletedGallery) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Gallery item not found"));
    }

    res
      .status(200)
      .json(new apiResponse(200, deletedGallery, "Gallery deleted successfully"));
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, `Error: ${error.message}`));
  }
});

export {
  createGallery,
  getAllGallery,
  getGalleryById,
  updateGallery,
  deleteGallery,
};
