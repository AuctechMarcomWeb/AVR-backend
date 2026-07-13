import BookConsultation from "../models/BookConsultation.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";

// CREATE CONSULTATION BOOKING (Public)
const createBookConsultation = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, date, slot, address, remarks } = req.body;

    // 🔹 Validations
    if (!name?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Name is required"));

    if (!email?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Email is required"));

    if (!phone?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Phone is required"));

    if (!date)
      return res
        .status(400)
        .json(new apiResponse(400, null, "Date is required"));

    if (!slot?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Slot is required"));

    if (!address?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Address is required"));

    // 🔹 Duplicate Check — same email + date + slot
    const existingBooking = await BookConsultation.findOne({
      email: email.trim().toLowerCase(),
      date: new Date(date),
      slot: slot.trim(),
    });

    if (existingBooking) {
      return res
        .status(409)
        .json(
          new apiResponse(
            409,
            null,
            "You have already booked this slot. Please choose a different date or slot."
          )
        );
    }

    // 🔹 Create Booking
    const booking = await BookConsultation.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      date: new Date(date),
      slot: slot.trim(),
      address: address.trim(),
      remarks: remarks?.trim() || "",
    });

    return res
      .status(201)
      .json(
        new apiResponse(201, booking, "Consultation booked successfully")
      );
  } catch (error) {
    return res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// GET ALL BOOKINGS (Admin)
const getAllBookConsultations = asyncHandler(async (req, res) => {
  try {
    const {
      isPagination = "true",
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = "recent",
    } = req.query;

    const match = {};

    if (status) match.status = status;

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      match.$or = [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
        { slot: { $regex: regex } },
        { address: { $regex: regex } },
      ];
    }

    let pipeline = [{ $match: match }];

    if (sortBy === "recent") {
      pipeline.push({ $sort: { createdAt: -1 } });
    } else if (sortBy === "oldest") {
      pipeline.push({ $sort: { createdAt: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    const totalArr = await BookConsultation.aggregate([
      ...pipeline,
      { $count: "count" },
    ]);
    const total = totalArr[0]?.count || 0;

    if (isPagination === "true") {
      pipeline.push(
        { $skip: (page - 1) * Number(limit) },
        { $limit: Number(limit) }
      );
    }

    const bookings = await BookConsultation.aggregate(pipeline);

    res.status(200).json(
      new apiResponse(
        200,
        {
          bookings,
          totalBookings: total,
          totalPages: Math.ceil(total / limit),
          currentPage: Number(page),
        },
        "Consultations fetched successfully"
      )
    );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// GET SINGLE BOOKING (Admin)
const getBookConsultationById = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid consultation ID"));
    }

    const booking = await BookConsultation.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Consultation not found"));
    }

    res
      .status(200)
      .json(new apiResponse(200, booking, "Consultation fetched successfully"));
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// UPDATE BOOKING (Admin)
const updateBookConsultation = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid consultation ID"));
    }

    const updatedBooking = await BookConsultation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Consultation not found"));
    }

    res
      .status(200)
      .json(
        new apiResponse(200, updatedBooking, "Consultation updated successfully")
      );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// DELETE BOOKING (Admin)
const deleteBookConsultation = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid consultation ID"));
    }

    const deletedBooking = await BookConsultation.findByIdAndDelete(
      req.params.id
    );

    if (!deletedBooking) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Consultation not found"));
    }

    res
      .status(200)
      .json(
        new apiResponse(200, deletedBooking, "Consultation deleted successfully")
      );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

export {
  createBookConsultation,
  getAllBookConsultations,
  getBookConsultationById,
  updateBookConsultation,
  deleteBookConsultation,
};
