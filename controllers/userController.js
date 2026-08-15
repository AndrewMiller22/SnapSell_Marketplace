/* SnapSell Marketplace - User Controller
 
  Developers (Jakob Lalicon): [301498508]
  Description: Handles registration, login, logout and profile management. */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    return "That username or email is already registered";
  }

  return null;
};

// POST /api/users/register - public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Please provide a username, email, password and full name"
      });
    }

    // Checked here so the message can say which one is taken
    const emailTaken = await User.findOne({ email: email.toLowerCase() });

    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: "An account with that email address already exists"
      });
    }

    const usernameTaken = await User.findOne({ username });

    if (usernameTaken) {
      return res.status(409).json({
        success: false,
        message: "That username is already taken"
      });
    }

    const user = await User.create({ username, email, password, fullName });

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address and password"
      });
    }

    // The password is hidden by default, so ask for it here
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    // A wrong email and a wrong password give the same message on purpose
    // Saying which one was wrong would let someone find out which emails have
    // SnapSell accounts
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
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

    const { username, email, fullName, password } = req.body;

    // Only check for duplicates when the value is actually changing, otherwise
    // saving the profile without edits would fail against the user's own record
    if (email && email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase() });

      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: "An account with that email address already exists"
        });
      }

      user.email = email;
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
