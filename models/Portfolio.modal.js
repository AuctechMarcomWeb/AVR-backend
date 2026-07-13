import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    clientName: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    duration: {
      type: String,
      trim: true,
    },

    thumbnailImage: {
      type: String,
      required: true,
    },

    bannerImage: {
      type: String,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      required: true,
    },

    galleryImages: [
      {
        type: String,
      }
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    activeStatus: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
