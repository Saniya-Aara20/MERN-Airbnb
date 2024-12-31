const Listing = require("../models/listing");

const { listingSchema } = require("../schema.js");

module.exports.index = async (req, res) => {
    let allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    // if (!req.isAuthenticated()) {                  //in middleware.js  now
    //     req.flash("error", "login to continue");
    //     return res.redirect("/login");
    // }
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });

};


module.exports.createListing = async (req, res, next) => {
    //let {title,description,image,price,country,location}=req.body;


    //console.log(req.body);

    //let listing = req.body.listing;
    // if (!req.body.listing) {
    //     throw new ExpressError(400, "Bad request - Send valid data for listing");
    // }
    //console.log(listing);


    let url = req.file.path;
    let filename = req.file.filename;
    //console.log(url, filename);
    const newListing = new Listing(req.body.listing);
    //console.log(req.body.listing);

    newListing.owner = req.user._id;
    newListing.image = { filename, url };

    await newListing.save();
    req.flash("success", "New listing created");
    res.redirect("/listings");



};


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        res.redirect("/listings");
    }
    let originalImgUrl = listing.image.url;
    originalImgUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing, originalImgUrl });
};

module.exports.updateListing = async (req, res) => {

    let { id } = req.params;

    // if (!req.body.listing) {
    //     throw new ExpressError(400, "Bad request - Send valid data for listing");
    // }


    // let listing = await Listing.findById(id);

    // if (!listing.owner._id.equals(res.locals.currUser._id)) {
    //     req.flash("error", "You dont have permission to edit");
    //     return res.redirect(`/listings/${id}`);
    // }
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { filename, url };
        await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let delList = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};