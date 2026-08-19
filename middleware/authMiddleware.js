//SnapSell Marketplace - Authentication Middleware
//Protects the secure routes.

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// When the token is valid it sets:
// req.user = { id, username, email, phone, fullName }

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look the user up each time so a deleted account cannot keep using an old token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user no longer exists"
      });
    }

    // id is turned into a string here. Listing ownership is checked
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      fullName: user.fullName
    };

    next();
  } catch (error) {
    // Separate message for an expired session so the frontend can tell the
    // user to log in again instead of showing a general error
    const message =
      error.name === "TokenExpiredError"
        ? "Not authorized, token expired"
        : "Not authorized, token failed";

    return res.status(401).json({
      success: false,
      message
    });
  }
};

// Sets req.user if a valid Bearer token is present, but never rejects the request.
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone || "",
        fullName: user.fullName
      };
    }
  } catch {
    // invalid/expired token — proceed as guest
  }
  next();
};

module.exports = { protect, optionalAuth };
