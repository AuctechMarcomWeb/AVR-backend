import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    heading: {
      type: String,
      trim: true,
    },

    seoTitle: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    metaKeywords: {
      type: String,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    mainImage: {
      type: String,
      trim: true,
    },

    multipleImages: {
      type: [String],
      default: [],
    },

    mainImageName: {
      type: String,
      trim: true,
    },

    details: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Search indexes
blogSchema.index({
  heading: "text",
  seoTitle: "text",
  shortDescription: "text",
  metaKeywords: "text",
});

export default mongoose.model("blog", blogSchema);