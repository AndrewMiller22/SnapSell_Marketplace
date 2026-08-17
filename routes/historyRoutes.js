const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getListingHistory } = require("../controllers/historyController");

const router = express.Router();

router.get("/listings/:listingId", protect, getListingHistory);

module.exports = router;
