const mongoose = require("mongoose");
const Listing = require("../models/Listing");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/listings
const getListings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.location) {
      filter.$or = (filter.$or || []).concat([
        { "location.city": { $regex: req.query.location, $options: "i" } },
        { "location.address": { $regex: req.query.location, $options: "i" } }
      ]);
    }

    if (req.query.search) {
      filter.$or = [
        {
          title: {
            $regex: req.query.search,
            $options: "i"
          }
        },
        {
          description: {
            $regex: req.query.search,
            $options: "i"
          }
        }
      ];
    }

    const listings = await Listing.find(filter).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve listings",
      error: error.message
    });
  }
};

// GET /api/listings/:id
const getListingById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID"
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve the listing",
      error: error.message
    });
  }
};

// POST /api/listings
const createListing = async (req, res) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      sellerName: req.user.fullName,
      sellerEmail: req.user.email
    });

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: listing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to create listing",
      error: error.message
    });
  }
};

// PUT or PATCH /api/listings/:id
const updateListing = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID"
      });
    }

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: listing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to update listing",
      error: error.message
    });
  }
};

// DELETE /api/listings/:id
const deleteListing = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID"
      });
    }

    const listing = await Listing.findByIdAndDelete(
      req.params.id
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete listing",
      error: error.message
    });
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
};
    
