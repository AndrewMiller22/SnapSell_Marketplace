const mongoose = require("mongoose");
const Listing = require("../models/Listing");
const Question = require("../models/Question");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Public: submit a question about an available listing.
const createQuestion = async (req, res) => {
  try {
    if (!isValidId(req.params.listingId)) {
      return res.status(400).json({ success: false, message: "Invalid listing ID" });
    }

    const listing = await Listing.findOne({ _id: req.params.listingId, status: "Available" });
    if (!listing) {
      return res.status(404).json({ success: false, message: "Available listing not found" });
    }

    const question = await Question.create({
      listing: listing._id,
      askerName: req.body.askerName,
      askerEmail: req.body.askerEmail || "",
      question: req.body.question
    });

    res.status(201).json({ success: true, message: "Message sent successfully", data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: "Unable to send message", error: error.message });
  }
};

// Public: only answered questions are exposed on a listing page.
const getAnsweredQuestions = async (req, res) => {
  try {
    if (!isValidId(req.params.listingId)) {
      return res.status(400).json({ success: false, message: "Invalid listing ID" });
    }

    const questions = await Question.find({
      listing: req.params.listingId,
      answer: { $nin: [null, ""] }
    })
      .select("askerName question answer answeredBy answeredAt createdAt")
      .sort({ answeredAt: -1 });

    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to retrieve messages", error: error.message });
  }
};

// Protected: retrieve questions for listings owned by the logged-in seller.
const getSellerQuestions = async (req, res) => {
  try {
    const ownedListings = await Listing.find({ owner: req.user.id }).select("_id");
    const listingIds = ownedListings.map((listing) => listing._id);
    const questions = await Question.find({ listing: { $in: listingIds } })
      .populate("listing", "title status")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to retrieve seller messages", error: error.message });
  }
};

// Protected: only the listing owner can answer its questions.
const answerQuestion = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid message ID" });
    }

    const answer = typeof req.body.answer === "string" ? req.body.answer.trim() : "";
    if (answer.length < 2 || answer.length > 1000) {
      return res.status(400).json({ success: false, message: "Reply must be between 2 and 1000 characters" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const ownedListing = await Listing.exists({ _id: question.listing, owner: req.user.id });
    if (!ownedListing) {
      return res.status(403).json({ success: false, message: "You can only reply to messages about your own listings" });
    }

    question.answer = answer;
    question.answeredBy = req.user.username;
    question.answeredAt = new Date();
    await question.save();
    await question.populate("listing", "title status");

    res.status(200).json({ success: true, message: "Reply saved successfully", data: question });
  } catch (error) {
    res.status(400).json({ success: false, message: "Unable to save reply", error: error.message });
  }
};

module.exports = { createQuestion, getAnsweredQuestions, getSellerQuestions, answerQuestion };
