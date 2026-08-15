/**
 * SnapSell Marketplace - Listing Controllers
 *
 * Developers: [Add all student IDs]
 *
 * Handles public listing retrieval and secure owner-only listing management.
 */

const mongoose = require("mongoose");
const Listing = require("../models/Listing");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const allowedStatuses = [
  "Available",
  "Pending",
  "Sold",
  "Expired"
];

// Public: retrieve available listings
const getListings = async (req, res) => {
  try {
    const now = new Date();

    const filter = {
      status: "Available",
      activeDate: { $lte: now },
      $and: [
        {
          $or: [
            { expiryDate: null },
            { expiryDate: { $gt: now } }
          ]
        }
      ]
    };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.location) {
      const locationSearch = {
        $regex: req.query.location,
        $options: "i"
      };

      filter.$and.push({
        $or: [
          { "location.address": locationSearch },
          { "location.city": locationSearch },
          { "location.province": locationSearch },
          { "location.postalCode": locationSearch }
        ]
      });
    }

    if (req.query.search) {
      const textSearch = {
        $regex: req.query.search,
        $options: "i"
      };

      filter.$and.push({
        $or: [
          { title: textSearch },
          { description: textSearch }
        ]
      });
    }

    const listings = await Listing.find(filter)
      .populate("owner", "username fullName")
      .sort({ createdAt: -1 });

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

// Public: retrieve one available listing
const getListingById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID"
      });
    }

    const listing = await Listing.findOne({
      _id: req.params.id,
      status: "Available"
    }).populate("owner", "username fullName");

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Available listing not found"
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

// Protected: retrieve all listings belonging to the logged-in user
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      owner: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve your listings",
      error: error.message
    });
  }
};

// Protected: create a listing for the logged-in user
const createListing = async (req, res) => {
  try {
    const listing = await Listing.create({
      ...req.body,

      // Ownership and seller details come from the verified JWT user.
      owner: req.user.id,
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

// Protected: edit only a listing owned by the logged-in user
const updateListing = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID"
      });
    }

    // Only these listing fields can be changed.
    const allowedFields = [
      "title",
      "description",
      "price",
      "category",
      "condition",
      "location",
      "images",
      "activeDate",
      "expiryDate"
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const listing = await Listing.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found or you do not own this listing"
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

// Protected: change the status instead of permanently deleting a listing
const updateListingStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID"
      });
    }

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Available, Pending, Sold, or Expired"
      });
    }

    const listing = await Listing.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id
      },
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found or you do not own this listing"
      });
    }

    res.status(200).json({
      success: true,
      message: `Listing status changed to ${status}`,
      data: listing
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to update listing status",
      error: error.message
    });
  }
};

module.exports = {
  getListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  updateListingStatus
};