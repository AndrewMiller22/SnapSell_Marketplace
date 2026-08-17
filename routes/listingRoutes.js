const express = require("express");

const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} = require("../controllers/listingControllers");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(getListings)
  .post(protect, createListing);

router
  .route("/:id")
  .get(getListingById)
  .put(protect, updateListing)
  .patch(protect, updateListing)
  .delete(protect, deleteListing);

module.exports = router;