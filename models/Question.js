//for users logged in , this section describes the messaging forms to be filled by a user reaching out to a listing

const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    askerName: { type: String, required: [true, "Your name is required"], trim: true, minlength: 2, maxlength: 80 },
    askerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
      match: [/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"]
    },
    question: { type: String, required: [true, "A message is required"], trim: true, minlength: 5, maxlength: 500 },
    answer: { type: String, trim: true, maxlength: 1000, default: null },
    answeredBy: { type: String, trim: true, default: null },
    answeredAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
