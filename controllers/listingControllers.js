const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const { createHistoryEntry } = require("./historyController");    
const { validateImages } = require("../utils/imageValidation");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const allowedStatuses = ["Available", "Pending", "Sold", "Expired"];

const getValidationMessage = (error) => {
  if (error?.name !== "ValidationError") return null;

  return Object.values(error.errors)
    .map((validationError) => validationError.message)
    .filter(Boolean)
    .join(". ");
};

//builds the rules for Mongodb to use to compaire required conditions
const getListings = async (req, res) => {
  try {
    const now = new Date();
    const filter = {
      status: "Available",
      activeDate: { $lte: now },
      $and: [{ $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }] }]
    };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.location) {
      const match = { $regex: req.query.location, $options: "i" };
      filter.$and.push({ $or: [
        { "location.address": match }, { "location.city": match },
        { "location.province": match }, { "location.postalCode": match }
      ] });
    }
    if (req.query.search) {
      const match = { $regex: req.query.search, $options: "i" };
      filter.$and.push({ $or: [{ title: match }, { description: match }] });
    }

    const listings = await Listing.find(filter).populate("owner", "username fullName").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to retrieve listings", error: error.message });
  }
};

const getListingById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid listing ID" });
    const listing = await Listing.findById(req.params.id).populate("owner", "username fullName");
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to retrieve the listing", error: error.message });
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to retrieve your listings", error: error.message });
  }
};

const createListing = async (req, res) => {
  try {
    const imageValidation = validateImages(req.body.images || []);
    if (!imageValidation.valid) {
      return res.status(400).json({ success: false, message: imageValidation.message });
    }

    const listing = await Listing.create({
      ...req.body,
      owner: req.user.id,
      sellerName: req.user.fullName,
      sellerEmail: req.user.email
    });
    res.status(201).json({ success: true, message: "Listing created successfully", data: listing });
  } catch (error) {
    const validationMessage = getValidationMessage(error);
    if (validationMessage) {
      return res.status(400).json({ success: false, message: validationMessage });
    }

    console.error("Create listing failed:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to post the listing right now. Please try again."
    });
  }
};

const updateListing = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid listing ID" });

    const allowedFields = ["title", "description", "price", "category", "condition", "location", "images", "categoryDetails", "activeDate", "expiryDate"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.images !== undefined) {
      const imageValidation = validateImages(updates.images);
      if (!imageValidation.valid) {
        return res.status(400).json({ success: false, message: imageValidation.message });
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No editable listing fields were provided" });
    }

    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found or you do not own this listing" });

    const changedFields = Object.keys(updates).join(", ");
    await createHistoryEntry(listing._id, req.user.username, `Updated listing fields: ${changedFields}`);
    res.status(200).json({ success: true, message: "Listing updated successfully", data: listing });
  } catch (error) {
    res.status(400).json({ success: false, message: "Unable to update listing", error: error.message });
  }
};

const updateListingStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid listing ID" });
    const { status } = req.body;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Available, Pending, Sold, or Expired" });
    }

    const original = await Listing.findOne({ _id: req.params.id, owner: req.user.id });
    if (!original) return res.status(404).json({ success: false, message: "Listing not found or you do not own this listing" });
    const previousStatus = original.status;
    original.status = status;
    await original.save();

    await createHistoryEntry(original._id, req.user.username, `Changed status from ${previousStatus} to ${status}`);
    res.status(200).json({ success: true, message: `Listing status changed to ${status}`, data: original });
  } catch (error) {
    res.status(400).json({ success: false, message: "Unable to update listing status", error: error.message });
  }
};

module.exports = { getListings, getListingById, getMyListings, createListing, updateListing, updateListingStatus };
