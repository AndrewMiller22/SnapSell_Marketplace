const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createQuestion,
  getSellerQuestions,
  answerQuestion
} = require("../controllers/questionController");

const router = express.Router();

// All messaging endpoints are protected. Messages are never exposed publicly.
router.get("/seller", protect, getSellerQuestions);
router.post("/listings/:listingId", protect, createQuestion);
router.patch("/:id/answer", protect, answerQuestion);

module.exports = router;
