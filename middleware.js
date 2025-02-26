const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectURL = req.originalUrl;
        req.flash("error", "You must be signed in to create a new listing!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectURL){
        res.locals.redirectURL = req.session.redirectURL;
    }
    next();
}

module.exports.isOwner = async ( req, res, next) => {
    let listing = await Listing.findById(req.params.id);
    if(!listing.owner._id.equals(res.locals.currentUser._id)){
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${listing._id}`);
    }
    next();
}

module.exports.isAuthor = async ( req, res, next) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);

    let review = await Review.findById(req.params.reviewId);
    if(!review.author._id.equals(res.locals.currentUser._id)){
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${listing._id}`);
    }
    next();
}