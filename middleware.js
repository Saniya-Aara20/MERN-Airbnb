const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const Listing = require("./models/listing");
const Review = require("./models/review");
module.exports.isLoggedIn = (req, res, next) => {
    //console.log(req.path, req.originalUrl);

    if (!req.isAuthenticated()) {

        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "login to continue");
        return res.redirect("/login");
    }

    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    //console.log(result);
    if (error) {

        let erMsg = error.details.map((el) => el.message);
        throw new ExpressError(400, erMsg);

    }
    else {
        next();
    }
}


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    //console.log(result);
    if (error) {

        let erMsg = error.details.map((el) => el.message);
        throw new ExpressError(400, erMsg);
    }
    else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    console.log(review);
    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You donot have access to change this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
}