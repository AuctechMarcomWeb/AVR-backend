import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    url: { type: String }, // optional
    heading: { type: String }, // optional
    seoTitle: { type: String },
    metaKeywords: { type: String },
    shortDescription: { type: String },
    mainImage: { type: String },
    multipleImages: { type: [String], default: [] },
    mainImageName: { type: String },
    details: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("blog", blogSchema);
