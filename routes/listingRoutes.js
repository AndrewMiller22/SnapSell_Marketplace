const express = require("express");

const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} = require("../controllers/listingControllers");

const router = express.Router();

router
  .route("/")
  .get(getListings)
  .post(createListing);

router
  .route("/:id")
  .get(getListingById)
  .put(updateListing)
  .patch(updateListing)
  .delete(deleteListing);

module.exports = router;