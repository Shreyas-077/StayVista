const Listing = require("../models/listing");


module.exports.index = async(req, res) => {
    let allListings = await Listing.find();
    res.render("listings/index.ejs",{allListings});
}

module.exports.newListing =(req, res) => {
    
    res.render("listings/new.ejs");
}

module.exports.createListing = async(req, res, next) => {
    // listingSchema.validate(req.body);
    let url = req.file.path;
    let filename = req.file.filename;
   let {title, description, image, price, location, country} = req.body;
    let newListing = new Listing({
        title : title,
        description : description,
        // image : {
        //     filename : image.filename,
        //     url : image.url
        // },
        price : price,
        location : location,
        country : country,
        owner : req.user._id
    });
    newListing.image = { url, filename };
    await newListing.save();
    
    req.flash("success", "Successfully created a new listing!");

    res.redirect("/listings");
    
}

module.exports.showListing = async(req, res) => {
    let listing = await Listing.findById(req.params.id).populate({path : "reviews",
    populate : {
        path : "author"
    }}).populate("owner");
    if(!listing){
        req.flash("error", "The listing you requested is not available!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}

module.exports.editListing = async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    if(!listing){
        req.flash("error", "The listing you requested is not available!");
        return res.redirect("/listings");
    }
    

    let originalImageUrl = listing.image.url;
    let transformedImageUrl = originalImageUrl.replace("/upload/", "/upload/w_200/");
    console.log("Original Image URL:", originalImageUrl);
console.log("Transformed Image URL:", transformedImageUrl);


    res.render("listings/edit.ejs", { listing, originalImageUrl: transformedImageUrl });
}

module.exports.updateListing = async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    // listingSchema.validate(req.body);
    
    
    let { title, description, image, price, location, country } = req.body;
    
    let updatedData = {
        title: title,
        description: description,
        price: price,
        location: location,
        country: country
    };
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        updatedData.image = { url, filename };
    }
    await Listing.findByIdAndUpdate(req.params.id, updatedData, { runValidators: true, new: true });
    req.flash("success", "Successfully updated a listing!");
    res.redirect("/listings");
    
}

module.exports.deleteListing = async(req, res) => {
    await Listing.deleteOne({_id: req.params.id});
    req.flash("success", "Successfully deleted a listing!");
    res.redirect("/listings");
}