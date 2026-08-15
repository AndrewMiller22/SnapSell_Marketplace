/**
 * SnapSell Marketplace - Listing Model
 *
 * Developers: 
 *
 * Stores marketplace listings and associates each listing with its owner.
 */

const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A listing title is required"],
      trim: true,
      minlength: [3, "The title must be at least 3 characters"],
      maxlength: [100, "The title cannot exceed 100 characters"]
    },

    description: {
      type: String,
      required: [true, "A description is required"],
      trim: true,
      minlength: [10, "The description must be at least 10 characters"],
      maxlength: [600, "The description cannot exceed 600 characters"]
    },

    price: {
      type: Number,
      required: [true, "A price is required"],
      min: [0, "The price cannot be negative"]
    },

    category: {
      type: String,
      required: [true, "A category is required"],
      enum: [
        "Electronics",
        "Vehicles",
        "Home and Garden",
        "Clothing",
        "Sports",
        "Collectibles",
        "Other"
      ]
    },

    condition: {
      type: String,
      required: [true, "The item's condition is required"],
      enum: [
        "New",
        "Like New",
        "Used - Good",
        "Used - Fair"
      ]
    },

    location: {
      address: {
        type: String,
        required: [true, "An address or location is required"],
        trim: true
      },

      city: {
        type: String,
        required: [true, "A city is required"],
        trim: true
      },

      province: {
        type: String,
        required: [true, "A province is required"],
        trim: true,
        uppercase: true,
        minlength: [2, "Use a two-letter province code"],
        maxlength: [2, "Use a two-letter province code"]
      },

      postalCode: {
        type: String,
        trim: true,
        uppercase: true
      }
    },

    images: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ["Available", "Pending", "Sold", "Expired"],
      default: "Available"
    },

    activeDate: {
      type: Date,
      default: Date.now
    },

    expiryDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (expiryDate) {
          return (
            expiryDate === null ||
            expiryDate === undefined ||
            expiryDate > this.activeDate
          );
        },
        message: "The expiry date must be after the active date"
      }
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A listing owner is required"],
      index: true
    },

    sellerName: {
      type: String,
      required: true,
      trim: true
    },

    sellerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Listing", listingSchema);