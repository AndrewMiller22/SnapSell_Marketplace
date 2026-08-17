//

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

router.route("/").get(getListings).post(protect, createListing);
router.get("/user/mine", protect, getMyListings);
router.patch("/:id/status", protect, updateListingStatus);
router.route("/:id").get(getListingById).put(protect, updateListing).patch(protect, updateListing);

module.exports = router;
