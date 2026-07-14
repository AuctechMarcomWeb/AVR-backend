import mongoose from "mongoose";
import ContactPage from "../models/ContactPage.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

// CREATE CONTACT
const createContactPage = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Name is required"));
    }

    if (!email?.trim()) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Email is required"));
    }

    if (!phone?.trim()) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Phone is required"));
    }

    if (!message?.trim()) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Message is required"));
    }

    // Duplicate check
    const existingContact = await ContactPage.findOne({
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    if (existingContact) {
      return res
        .status(409)
        .json(new apiResponse(409, null, "You have already sent this message"));
    }

    const contact = await ContactPage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
    });

    return res
      .status(201)
      .json(new apiResponse(201, contact, "Contact message sent successfully"));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// GET ALL CONTACTS
const getAllContactPages = asyncHandler(async (req, res) => {
  try {
    const {
      isPagination = "true",
      page = 1,
      limit = 10,
      search,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const match = {};

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");

      match.$or = [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
        { message: { $regex: regex } },
      ];
    }

    const total = await ContactPage.countDocuments(match);

    let query = ContactPage.find(match).sort({ createdAt: -1 });

    if (isPagination === "true") {
      query = query
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
    }

    const contacts = await query;

    return res.status(200).json(
      new apiResponse(
        200,
        {
          contacts,
          totalContacts: total,
          totalPages:
            isPagination === "true"
              ? Math.ceil(total / limitNumber)
              : total > 0
                ? 1
                : 0,
          currentPage: pageNumber,
        },
        "Contacts fetched successfully"
      )
    );
  } catch (error) {
    return res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// GET SINGLE CONTACT
const getContactPageById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid contact ID"));
    }

    const contact = await ContactPage.findById(id);

    if (!contact) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Contact not found"));
    }

    return res
      .status(200)
      .json(new apiResponse(200, contact, "Contact fetched successfully"));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// UPDATE CONTACT
const updateContactPage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid contact ID"));
    }

    const allowedFields = ["name", "email", "phone", "message", "isRead"];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedContact = await ContactPage.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedContact) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Contact not found"));
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, updatedContact, "Contact updated successfully")
      );
  } catch (error) {
    return res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// DELETE CONTACT
const deleteContactPage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid contact ID"));
    }

    const deletedContact = await ContactPage.findByIdAndDelete(id);

    if (!deletedContact) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Contact not found"));
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, deletedContact, "Contact deleted successfully")
      );
  } catch (error) {
    return res.status(500).json(new apiResponse(500, null, error.message));
  }
});

export {
  createContactPage,
  getAllContactPages,
  getContactPageById,
  updateContactPage,
  deleteContactPage,
};