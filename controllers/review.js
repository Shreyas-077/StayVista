const Listing = require('../models/listing');
const Review = require('../models/review');

module.exports.newRev = async(req, res) => {
    let listing = await Listing.findById( req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    

    await newReview.save();
    await listing.save();
    req.flash("success", "Successfully created a new review!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteRev =  async(req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfull deleted a review!");
    res.redirect(`/listings/${id}`);    
}