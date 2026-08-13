/* SnapSell Marketplace - Server Entry Point
 
  Developers (Jakob Lalicon): [301498508]

  Starts the SnapSell Express API. Loads environment settings, connects to MongoDB,
  registers the public and secure route groups, and listens for requests. */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDatabase = require("./config/db");
const listingRoutes = require("./routes/listingRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

// Tokens signed with an undefined secret refuse to start rather than run an insecure server
if (!process.env.JWT_SECRET) {
  console.error(
    "JWT_SECRET is missing from your .env file. Add it before starting the server."
  );
  process.exit(1);
}

connectDatabase();

const app = express();

app.use(cors());
app.use(express.json());

// --- API status ---

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Marketplace API is running"
  });
});

// --- Route groups ---

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);

// --- Unmatched routes ---

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
