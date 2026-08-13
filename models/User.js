/* SnapSell Marketplace - User Model
 
  Developers (Jakob Lalicon): [301498508]
 
  Database schema for SnapSell users. Stores the login details
  and profile information, hashes the password before saving, and provides a
  method to check a password at login */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "A username is required"],
      unique: true,
      trim: true,
      minlength: [3, "The username must be at least 3 characters"],
      maxlength: [30, "The username cannot exceed 30 characters"],
      match: [
        /^[A-Za-z0-9_]+$/,
        "The username may only contain letters, numbers and underscores"
      ]
    },

    email: {
      type: String,
      required: [true, "An email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"]
    },

    password: {
      type: String,
      required: [true, "A password is required"],
      minlength: [6, "The password must be at least 6 characters"],

      // Hides the password from normal queries so it cannot be sent back by
      // mistake. Login asks for it with .select("+password")
      select: false
    },

    fullName: {
      type: String,
      required: [true, "A full name is required"],
      trim: true,
      maxlength: [80, "The full name cannot exceed 80 characters"]
    }
  },
  {
    timestamps: true
  }
);

// Hash the password before saving it to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compares a typed password with the saved hash. Returns true or false
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
