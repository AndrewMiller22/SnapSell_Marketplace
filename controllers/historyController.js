const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const ListingHistory = require("../models/ListingHistory");

const createHistoryEntry = (listingId, username, description) =>
  ListingHistory.create({ listing: listingId, username, description });

// Protected: any authenticated user may view a listing's audit history.
const getListingHistory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.listingId)) {
      return res.status(400).json({ success: false, message: "Invalid listing ID" });
    }

    const listingExists = await Listing.exists({ _id: req.params.listingId });
    if (!listingExists) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const history = await ListingHistory.find({ listing: req.params.listingId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to retrieve listing history", error: error.message });
  }
};

module.exports = { createHistoryEntry, getListingHistory };
