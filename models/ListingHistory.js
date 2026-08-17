const mongoose = require("mongoose");

//listing history will track the user's posts and actions on the listing as well.
const listingHistorySchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    username: { type: String, required: true, trim: true },
    actionDate: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true, trim: true, maxlength: 500 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ListingHistory", listingHistorySchema);
