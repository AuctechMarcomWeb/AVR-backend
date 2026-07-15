import mongoose from "mongoose";

const bookConsultationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    slot: {
      type: String,
      required: true,
      trim: true,
      // e.g. "10:00 AM", "2:30 PM", etc.
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    // admin side ke liye
    isRead: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Pending","Completed", "Confirmed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const BookConsultation = mongoose.model(
  "BookConsultation",
  bookConsultationSchema
);

export default BookConsultation;
