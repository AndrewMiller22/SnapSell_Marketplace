const express = require("express");
const { protect, optionalAuth } = require("../middleware/authMiddleware");
const {
  createQuestion,
  getSellerQuestions,
  answerQuestion
} = require("../controllers/questionController");

const router = express.Router();

router.get("/seller", protect, getSellerQuestions);
router.post("/listings/:listingId", optionalAuth, createQuestion); // guests allowed
router.patch("/:id/answer", protect, answerQuestion);

module.exports = router;
