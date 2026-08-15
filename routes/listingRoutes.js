const express = require("express");

const {
  getListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  updateListingStatus
} = require("../controllers/listingControllers");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public viewing, protected creation
router
  .route("/")
  .get(getListings)
  .post(protect, createListing);

// Logged-in user’s listings
router
  .route("/user/mine")
  .get(protect, getMyListings);

// Owner-only status change
router
  .route("/:id/status")
  .patch(protect, updateListingStatus);

// Public viewing and owner-only editing
router
  .route("/:id")
  .get(getListingById)
  .put(protect, updateListing)
  .patch(protect, updateListing);

module.exports = router;