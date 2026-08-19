//mongoose plug in so that the Nodejs can communicate with mongodb
const mongoose = require("mongoose");
const { validateImages } = require("../utils/imageValidation");
const { MAX_MEDIA_COUNT } = require("../utils/imageValidation");

const geoPointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], required: true, default: "Point" },
    coordinates: {
      type: [Number],
      required: [true, "Coordinates are required when a map location is provided"],
      validate: {
        validator: function (coordinates) {
          return (
            Array.isArray(coordinates) &&
            coordinates.length === 2 &&
            coordinates[0] >= -180 && coordinates[0] <= 180 &&
            coordinates[1] >= -90 && coordinates[1] <= 90
          );
        },
        message: "Coordinates must be provided as [longitude, latitude]"
      }
    }
  },
  { _id: false }
);

// Describes the requirements that make up a listing
const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "A listing title is required"], trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: [true, "A description is required"], trim: true, minlength: 10, maxlength: 600 },
    price: { type: Number, required: [true, "A price is required"], min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Vehicles", "Home and Garden", "Clothing", "Sports", "Collectibles", "Other"]
    },
    condition: { type: String, required: true, enum: ["New", "Like New", "Used - Good", "Used - Fair"] },
    location: {
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      province: { type: String, required: true, trim: true, uppercase: true, minlength: 2, maxlength: 2 },
      postalCode: { type: String, trim: true, uppercase: true },
      geoPoint: { type: geoPointSchema, default: undefined }
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => validateImages(images).valid,
        message: `Listings may only contain up to ${MAX_MEDIA_COUNT} valid photos or videos`
      }
    },
    categoryDetails: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ["Available", "Pending", "Sold", "Expired"], default: "Available" },
    activeDate: { type: Date, default: Date.now },
    expiryDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (expiryDate) { return expiryDate == null || expiryDate > this.activeDate; },
        message: "The expiry date must be after the active date"
      }
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerName: { type: String, required: true, trim: true },
    sellerEmail: { type: String, required: true, trim: true, lowercase: true }
  },
  { timestamps: true }
);

listingSchema.index({ "location.geoPoint": "2dsphere" });

module.exports = mongoose.model("Listing", listingSchema);
