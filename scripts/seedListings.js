/**
 * Seed script – populates the database with sample listings for every category.
 * Usage:  node scripts/seedListings.js
 * Requires a .env file with MONGO_URI set.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const Listing = require("../models/Listing");
const User = require("../models/User");

const SEED_USER = {
  username: "snapsell_demo",
  email: "demo@snapsell.local",
  phone: "6135550001",
  password: "DemoPass123!",
  fullName: "SnapSell Demo",
};

const listings = [
  // ── Vehicles ────────────────────────────────────────────────────────────────
  {
    title: "2018 Toyota Camry LE",
    description:
      "Well-maintained one-owner Camry. Highway driven, never in an accident. Fresh oil change, new tires last spring. Smoke-free interior. Priced to sell quickly.",
    price: 15500,
    category: "Vehicles",
    condition: "Used - Good",
    location: { address: "101 Riverside Dr", city: "Ottawa", province: "ON", postalCode: "K1A0A9" },
    categoryDetails: { year: 2018, make: "Toyota", model: "Camry LE", colour: "Silver", mileage: 74800, transmission: "Automatic", fuelType: "Gasoline" },
  },
  {
    title: "2021 Honda Civic Sport",
    description:
      "Sporty Civic Sport with turbo engine and Honda Sensing suite. Heated seats, Apple CarPlay, dual-zone climate. Always dealer serviced. No accidents.",
    price: 22000,
    category: "Vehicles",
    condition: "Like New",
    location: { address: "55 King St W", city: "Toronto", province: "ON", postalCode: "M5H1H1" },
    categoryDetails: { year: 2021, make: "Honda", model: "Civic Sport", colour: "Sonic Gray Pearl", mileage: 35200, transmission: "CVT", fuelType: "Gasoline" },
  },
  {
    title: "2015 Ford F-150 XLT 4×4",
    description:
      "Reliable workhorse truck with tow package, box liner, and heated mirrors. Recent brake service. Some minor box scratches – priced accordingly.",
    price: 24500,
    category: "Vehicles",
    condition: "Used - Good",
    location: { address: "200 Main St N", city: "Brampton", province: "ON", postalCode: "L6X0A6" },
    categoryDetails: { year: 2015, make: "Ford", model: "F-150 XLT", colour: "Oxford White", mileage: 148000, transmission: "Automatic", fuelType: "Gasoline" },
  },

  // ── Electronics ─────────────────────────────────────────────────────────────
  {
    title: "iPhone 14 Pro 256 GB – Deep Purple",
    description:
      "Purchased new, used for 10 months. Always in a case with screen protector. Battery health 94%. Unlocked, works on all carriers. Comes with original box and cable.",
    price: 850,
    category: "Electronics",
    condition: "Like New",
    location: { address: "300 Sparks St", city: "Ottawa", province: "ON", postalCode: "K1P5B5" },
    categoryDetails: { brand: "Apple", model: "iPhone 14 Pro", storageCapacity: "256 GB", screenSize: '6.1"' },
  },
  {
    title: "Dell XPS 15 9500 Laptop",
    description:
      "Powerful laptop for creative work and gaming. Intel i7-10750H, 16 GB RAM, 512 GB NVMe SSD, GTX 1650 Ti. Minor scuff on the lid. Comes with original charger.",
    price: 1100,
    category: "Electronics",
    condition: "Used - Good",
    location: { address: "10 Bay St", city: "Toronto", province: "ON", postalCode: "M5J2R8" },
    categoryDetails: { brand: "Dell", model: "XPS 15 9500", storageCapacity: "512 GB SSD", screenSize: '15.6"' },
  },
  {
    title: "Sony PlayStation 5 Disc Edition",
    description:
      "PS5 disc console, barely used. Comes with two DualSense controllers, HDMI cable, and power cord. No games included. Perfect working condition.",
    price: 480,
    category: "Electronics",
    condition: "Like New",
    location: { address: "420 Queens Quay W", city: "Toronto", province: "ON", postalCode: "M5V3A6" },
    categoryDetails: { brand: "Sony", model: "PlayStation 5", storageCapacity: "825 GB SSD" },
  },

  // ── Home and Garden ──────────────────────────────────────────────────────────
  {
    title: "IKEA Billy Bookcase – White",
    description:
      "Classic Billy bookcase with adjustable shelves and door add-on. Excellent condition, assembled only once. Buyer to disassemble and transport. Dimensions: 80×30×202 cm.",
    price: 75,
    category: "Home and Garden",
    condition: "Like New",
    location: { address: "88 Elgin St", city: "Ottawa", province: "ON", postalCode: "K1P5K2" },
    categoryDetails: { material: "Particleboard / foil finish", dimensions: "80×30×202 cm", roomType: "Living Room / Office" },
  },
  {
    title: "7-Piece Outdoor Patio Set",
    description:
      "Aluminium frame dining table with 6 weather-resistant chairs. Used for two summers, stored indoors every fall. All cushions included. Minor surface scratches on one chair.",
    price: 420,
    category: "Home and Garden",
    condition: "Used - Good",
    location: { address: "500 Rideau St", city: "Ottawa", province: "ON", postalCode: "K1N5Z5" },
    categoryDetails: { material: "Aluminium / Polyester cushions", dimensions: "180×90 cm table", roomType: "Patio / Backyard" },
  },
  {
    title: "Honda HRX217 Self-Propelled Lawn Mower",
    description:
      "Honda 4-in-1 Versamow mower in great shape. Electric start, rear-wheel drive. Oil and air filter replaced last season. No cracks in the deck.",
    price: 320,
    category: "Home and Garden",
    condition: "Used - Good",
    location: { address: "12 Oak Ave", city: "Mississauga", province: "ON", postalCode: "L5A1W1" },
    categoryDetails: { material: "Steel deck", dimensions: '21" cutting width', roomType: "Garden / Yard" },
  },

  // ── Clothing ────────────────────────────────────────────────────────────────
  {
    title: "Nike Air Max 270 – Size 10",
    description:
      "Worn only a handful of times, still near mint. Air unit fully intact. No heel drag, no creasing. Original box included.",
    price: 90,
    category: "Clothing",
    condition: "Like New",
    location: { address: "1 Yonge St", city: "Toronto", province: "ON", postalCode: "M5E1W7" },
    categoryDetails: { brand: "Nike", size: "10 US / 44 EU", colour: "Black / Anthracite", gender: "Men" },
  },
  {
    title: "Canada Goose Expedition Parka – Women's S",
    description:
      "Authentic Canada Goose Expedition Parka in Navy. Worn two winters, dry-cleaned once. All zippers and snaps work perfectly. Fur trim intact.",
    price: 650,
    category: "Clothing",
    condition: "Used - Good",
    location: { address: "700 St-Catherine W", city: "Montreal", province: "QC", postalCode: "H3B1B8" },
    categoryDetails: { brand: "Canada Goose", size: "Small", colour: "Navy", gender: "Women" },
  },
  {
    title: "Levi's 514 Straight Fit Jeans – 32×32",
    description:
      "Dark wash Levi's 514 straight jeans. Worn maybe 10 times – still stiff and dark. No fading, no tears.",
    price: 40,
    category: "Clothing",
    condition: "Like New",
    location: { address: "200 Wellington St W", city: "Toronto", province: "ON", postalCode: "M5V3G2" },
    categoryDetails: { brand: "Levi's", size: "32×32", colour: "Dark Wash Indigo", gender: "Men" },
  },

  // ── Sports ──────────────────────────────────────────────────────────────────
  {
    title: "Trek Marlin 6 Mountain Bike – Medium",
    description:
      "2022 Trek Marlin 6 hardtail MTB. 21-speed, hydraulic disc brakes, 29\" wheels. Ridden on local trails ~20 times. No crashes, derailleur freshly adjusted.",
    price: 780,
    category: "Sports",
    condition: "Like New",
    location: { address: "99 Portage Ave", city: "Winnipeg", province: "MB", postalCode: "R3B2A9" },
    categoryDetails: { brand: "Trek", sportType: "Mountain Biking", size: "Medium (17.5\")" },
  },
  {
    title: "Wilson Pro Staff RF97 Tennis Racket",
    description:
      "Roger Federer signature racket strung with Wilson Natural Gut. Grip size 4 1/4. Light use – played with 5 times at the club. Comes with original cover.",
    price: 120,
    category: "Sports",
    condition: "Like New",
    location: { address: "300 Water St", city: "Vancouver", province: "BC", postalCode: "V6B1B6" },
    categoryDetails: { brand: "Wilson", sportType: "Tennis", size: "4 1/4 grip / 340 g" },
  },
  {
    title: "Adidas Predator Accuracy FG Soccer Cleats – Sz 11",
    description:
      "High-performance soccer cleats used for one season on natural grass. Firm ground outsole in excellent shape. Uppers clean with no tears.",
    price: 65,
    category: "Sports",
    condition: "Used - Good",
    location: { address: "1 Stadium Rd", city: "Hamilton", province: "ON", postalCode: "L8L8J0" },
    categoryDetails: { brand: "Adidas", sportType: "Soccer", size: "11 US / 45.5 EU" },
  },

  // ── Collectibles ────────────────────────────────────────────────────────────
  {
    title: "1984 LEGO Space Galaxy Explorer (Set 497) – Complete",
    description:
      "Classic LEGO Space set from 1984. All 358 pieces present including 4 astronaut minifigures. Original instruction booklet included. Some yellowing on white bricks.",
    price: 280,
    category: "Collectibles",
    condition: "Used - Good",
    location: { address: "42 Portage Ave E", city: "Winnipeg", province: "MB", postalCode: "R3C0A6" },
    categoryDetails: { era: "1984", brand: "LEGO", material: "ABS Plastic" },
  },
  {
    title: "1990s Wayne Gretzky Upper Deck Hockey Cards (Lot of 12)",
    description:
      "12-card lot of Wayne Gretzky Upper Deck cards from the early 90s. Mix of base and insert cards. Grades range from VG to NM. Stored in protective sleeves since purchase.",
    price: 175,
    category: "Collectibles",
    condition: "Used - Good",
    location: { address: "89 King St E", city: "Hamilton", province: "ON", postalCode: "L8N1A6" },
    categoryDetails: { era: "1990–1994", brand: "Upper Deck / O-Pee-Chee", material: "Card stock" },
  },

  // ── Other ───────────────────────────────────────────────────────────────────
  {
    title: "Bundle of 20 Moving Boxes (Various Sizes)",
    description:
      "Clean moving boxes from a recent long-distance move. Mix of small, medium and large – all in good structural condition. Great for your next move or storage.",
    price: 25,
    category: "Other",
    condition: "Used - Good",
    location: { address: "5 Industrial Pkwy", city: "Oakville", province: "ON", postalCode: "L6H5V9" },
    categoryDetails: {},
  },
  {
    title: "Graco Modes Pram Travel System",
    description:
      "Complete travel system including stroller, infant car seat, and base. Used for one child, smoke-free and pet-free home. Washed fabric, no rips or stains.",
    price: 180,
    category: "Other",
    condition: "Used - Good",
    location: { address: "60 Meadowvale Blvd", city: "Mississauga", province: "ON", postalCode: "L5N2T6" },
    categoryDetails: {},
  },
];

const seed = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set in .env. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // Find or create the demo seed user
  let seedUser = await User.findOne({ username: SEED_USER.username });
  if (!seedUser) {
    const hashed = await bcrypt.hash(SEED_USER.password, 10);
    seedUser = await User.create({ ...SEED_USER, password: hashed });
    console.log(`Created seed user: ${SEED_USER.username}`);
  } else {
    console.log(`Using existing seed user: ${SEED_USER.username}`);
  }

  let created = 0;
  for (const data of listings) {
    const existing = await Listing.findOne({ title: data.title, owner: seedUser._id });
    if (existing) {
      console.log(`  skip (already exists): ${data.title}`);
      continue;
    }
    await Listing.create({
      ...data,
      owner: seedUser._id,
      sellerName: seedUser.fullName,
      sellerEmail: seedUser.email,
    });
    console.log(`  created: ${data.title}`);
    created++;
  }

  console.log(`\nDone. ${created} listing(s) created.`);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
