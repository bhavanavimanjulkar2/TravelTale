const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing, filterListings } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


// ==============================
// 1️⃣ ROOT ROUTE
// ==============================
router
  .route("/")
  .get(
    wrapAsync(listingController.index),
    filterListings
  )
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListing)
  );


// ==============================
// 2️⃣ STATIC ROUTES (VERY IMPORTANT)
// ==============================

// ➕ New listing form
router.get(
  "/new",
  isLoggedIn,
  listingController.renderNewForm
);

// 🧭 Timeline (My Journey)
router.get(
  "/timeline",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id })
      .sort({ visitDate: 1 }); // oldest → newest

    res.render("listings/timeline.ejs", { listings });
  })
);


// ==============================
// 3️⃣ EDIT ROUTE (before :id)
// ==============================
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);


// ==============================
// 4️⃣ DYNAMIC ROUTE (ALWAYS LAST)
// ==============================
router
  .route("/:id")
  .get(
    wrapAsync(listingController.showListing)
  )
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );


module.exports = router;
