const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createQuestion,
  getAnsweredQuestions,
  getSellerQuestions,
  answerQuestion
} = require("../controllers/questionController");

const router = express.Router();

router.get("/seller", protect, getSellerQuestions);
router.route("/listings/:listingId").get(getAnsweredQuestions).post(createQuestion);
router.patch("/:id/answer", protect, answerQuestion);

module.exports = router;
