import ContactPage from "../models/ContactPage.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import mongoose from "mongoose";

// CREATE CONTACT
const createContactPage = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

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

    if (!subject?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Subject is required"));

    if (!message?.trim())
      return res
        .status(400)
        .json(new apiResponse(400, null, "Message is required"));

    // 🔹 Duplicate Check (anti-spam logic)
    const existingContact = await ContactPage.findOne({
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    if (existingContact) {
      return res
        .status(409)
        .json(new apiResponse(409, null, "You have already sent this message"));
    }

    // 🔹 Create Contact
    const contact = await ContactPage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return res
      .status(201)
      .json(new apiResponse(201, contact, "Contact message sent successfully"));
  } catch (error) {
    return res.status(500).json(new apiResponse(500, null, error.message));
  }
});


//GET ALL CONTACTS (Admin)
const getAllContactPages = asyncHandler(async (req, res) => {
  try {
    const { isPagination = "true", page = 1, limit = 10, search } = req.query;

    const match = {};

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      match.$or = [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
        { subject: { $regex: regex } },
      ];
    }

    let pipeline = [{ $match: match }, { $sort: { createdAt: -1 } }];

    const totalArr = await ContactPage.aggregate([
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

    const contacts = await ContactPage.aggregate(pipeline);

    res.status(200).json(
      new apiResponse(
        200,
        {
          contacts,
          totalContacts: total,
          totalPages: Math.ceil(total / limit),
          currentPage: Number(page),
        },
        "Contacts fetched successfully"
      )
    );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

//GET SINGLE CONTACT
const getContactPageById = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid contact ID"));
    }

    const contact = await ContactPage.findById(req.params.id);

    if (!contact) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Contact not found"));
    }

    res
      .status(200)
      .json(new apiResponse(200, contact, "Contact fetched successfully"));
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

//UPDATE CONTACT
const updateContactPage = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid contact ID"));
    }

    const updatedContact = await ContactPage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Contact not found"));
    }

    res
      .status(200)
      .json(
        new apiResponse(200, updatedContact, "Contact updated successfully")
      );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

// DELETE CONTACT
const deleteContactPage = asyncHandler(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(new apiResponse(400, null, "Invalid contact ID"));
    }

    const deletedContact = await ContactPage.findByIdAndDelete(req.params.id);

    if (!deletedContact) {
      return res
        .status(404)
        .json(new apiResponse(404, null, "Contact not found"));
    }

    res
      .status(200)
      .json(
        new apiResponse(200, deletedContact, "Contact deleted successfully")
      );
  } catch (error) {
    res.status(500).json(new apiResponse(500, null, error.message));
  }
});

export {
  createContactPage,
  getAllContactPages,
  getContactPageById,
  updateContactPage,
  deleteContactPage,
};
