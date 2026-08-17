/* SnapSell Marketplace - User Controller
 
  Developers (Jakob Lalicon): [301498508]
  Description: Handles registration, login, logout and profile management. */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  normalizeEmail,
  normalizePhone,
  isValidEmail,
  isValidPhone
} = require("../utils/contactValidation");

// Creates a login token that lasts 7 days
// Only the user id is stored inside it
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

// Builds the version of a user that is safe to send back
const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  phone: user.phone || "",
  fullName: user.fullName,
  createdAt: user.createdAt
});

// Turns a mongoose error into a message the user can read
// Returns null if it is some other kind of error
const getValidationMessage = (error) => {
  if (error.name === "ValidationError") {
    return Object.values(error.errors)
      .map((field) => field.message)
      .join(". ");
  }

  // Error 11000 means a unique field was duplicated
  if (error.code === 11000) {
    if (error.keyPattern?.phone || error.keyValue?.phone) {
      return "An account with that phone number already exists";
    }
    if (error.keyPattern?.email || error.keyValue?.email) {
      return "An account with that email address already exists";
    }
    return "That username is already registered";
  }

  return null;
};

// POST /api/users/register - public
const registerUser = async (req, res) => {
  try {
    const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone);
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";

    if (!username || !email || !phone || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Please provide a full name, username, email, phone number and password"
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number"
      });
    }

    // Checked here so the message can say which one is taken
    const emailTaken = await User.findOne({ email });

    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: "An account with that email address already exists"
      });
    }

    const phoneTaken = await User.findOne({ phone });

    if (phoneTaken) {
      return res.status(409).json({
        success: false,
        message: "An account with that phone number already exists"
      });
    }

    const usernameTaken = await User.findOne({ username });

    if (usernameTaken) {
      return res.status(409).json({
        success: false,
        message: "That username is already taken"
      });
    }

    const user = await User.create({ username, email, phone, password, fullName });

    // A new user is logged in straight away and then log in with the same details
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: publicUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    const validationMessage = getValidationMessage(error);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to complete registration",
      error: error.message
    });
  }
};

// POST /api/users/login - public
const loginUser = async (req, res) => {
  try {
    const rawIdentifier = req.body.identifier ?? req.body.email ?? req.body.phone;
    const identifier = typeof rawIdentifier === "string" ? rawIdentifier.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email, phone number or username and password"
      });
    }

    // The password is hidden by default, so ask for it here
    let loginQuery;
    if (isValidEmail(identifier)) {
      loginQuery = { email: normalizeEmail(identifier) };
    } else if (isValidPhone(identifier)) {
      loginQuery = { phone: normalizePhone(identifier) };
    } else {
      loginQuery = { username: identifier };
    }

    const user = await User.findOne(loginQuery).select("+password");

    // A wrong identifier and a wrong password give the same message on purpose
    // Saying which one was wrong would let someone find out which details have
    // SnapSell accounts
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid login details"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: publicUser(user),
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to complete login",
      error: error.message
    });
  }
};

// POST /api/users/logout - protected
const logoutUser = async (req, res) => {
  // JWTs are stateless, so there is no session on the server to end.
  // the token expires on its own after 7 days
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

// GET /api/users/profile - protected
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve the profile",
      error: error.message
    });
  }
};

// PUT /api/users/profile - protected
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const { username, email, phone, fullName, password } = req.body;

    // Only check for duplicates when the value is actually changing, otherwise
    // saving the profile without edits would fail against the user's own record
    if (email !== undefined) {
      const normalizedEmail = normalizeEmail(email);
      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

      if (normalizedEmail !== user.email) {
        const emailTaken = await User.findOne({ email: normalizedEmail });

        if (emailTaken) {
          return res.status(409).json({
            success: false,
            message: "An account with that email address already exists"
          });
        }

        user.email = normalizedEmail;
      }
    }

    if (phone !== undefined) {
      const normalizedPhone = normalizePhone(phone);
      if (!isValidPhone(normalizedPhone)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid 10-digit phone number"
        });
      }

      if (normalizedPhone !== user.phone) {
        const phoneTaken = await User.findOne({ phone: normalizedPhone });

        if (phoneTaken) {
          return res.status(409).json({
            success: false,
            message: "An account with that phone number already exists"
          });
        }

        user.phone = normalizedPhone;
      }
    }

    if (username && username !== user.username) {
      const usernameTaken = await User.findOne({ username });

      if (usernameTaken) {
        return res.status(409).json({
          success: false,
          message: "That username is already taken"
        });
      }

      user.username = username;
    }

    if (fullName) {
      user.fullName = fullName;
    }

    // Password is optional. If one is sent, the model hashes it on save
    // If not, the old password is left alone
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    // A new token is sent because the username inside the client's session may
    // have changed
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: publicUser(updatedUser),
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    const validationMessage = getValidationMessage(error);

    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update the profile",
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile
};
