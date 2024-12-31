const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

const Listing = require("../models/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
// const upload = multer({ dest: "uploads/" });
const upload = multer({ storage });

const { isLoggedIn, isOwner, validateListing, validateReview } = require("../middleware.js");
const listingController = require("../controllers/listings.js");


router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));



router.get("/new", isLoggedIn, listingController.renderNewForm);

router.get("/filters/:filterType", async (req, res) => {
    //console.log(req.params);
    let { filterType } = req.params;
    //console.log(filterType);

    if (!filterType || !filterType.length) {
        req.flash("error", "Could not filter");
        res.redirect("/listings");
    }

    let listings = await Listing.find({ place: filterType });
    res.render("listings/places.ejs", { listings });
    //console.log(listings);
    // res.send("done");


});

router.get('/listing/searched/', wrapAsync(async (req, res) => {
    const { place } = req.query;
    //console.log(place);
    let listing = await Listing.findOne({ title: place });
    if (!listing) {
        req.flash("error", "No places with the given name");
        return res.redirect("/listings");
    }
    res.render("listings/searched.ejs", { listing });
}));


router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, upload.single('listing[image]'), validateListing, isOwner, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))



router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));



module.exports = router;