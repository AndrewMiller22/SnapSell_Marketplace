const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A listing title is required"],
      trim: true,
      maxlength: [100, "The title cannot exceed 100 characters"]
    },

    description: {
      type: String,
      required: [true, "A description is required"],
      trim: true,
      maxlength: [600, "Max is 600 characters"]
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
        trim: true
      },

      province: {
        type: String,
        trim: true
      },

      postalCode: {
        type: String,
        trim: true,
        uppercase: true
      },

      geoPoint: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point"
        },

        coordinates: {
          type: [Number],
          default: undefined,
          validate: {
            validator: function (coordinates) {
              return (
                coordinates === undefined ||
                (
                  coordinates.length === 2 &&
                  coordinates[0] >= -180 &&
                  coordinates[0] <= 180 &&
                  coordinates[1] >= -90 &&
                  coordinates[1] <= 90
                )
              );
            },
            message:
              "Coordinates must be provided as [longitude, latitude]"
          }
        }
      }
    },

    sellerName: {
      type: String,
      required: [true, "A seller name is required"],
      trim: true
    },

    sellerEmail: {
      type: String,
      required: [true, "A seller email is required"],
      trim: true,
      lowercase: true
    },

    images: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ["Available", "Pending", "Sold"],
      default: "Available"
    }
  },
  {
    timestamps: true
  }
);

listingSchema.index({
  "location.geoPoint": "2dsphere"
});

module.exports = mongoose.model("Listing", listingSchema);