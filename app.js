if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const Review = require('./models/review');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const asyncWrap = require('./utils/asyncWrap.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema, reviewSchema} = require('./schema.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const {isLoggedIn ,isOwner, isAuthor} = require('./middleware.js');
const listingController = require('./controllers/listing.js');
const reviewController = require('./controllers/review.js');
const multer = require('multer');
const {storage} = require('./cloudConfig.js');
const upload = multer({ storage });



const userRouter = require('./routes/user.js');


app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

main().then(() => { console.log("mongo db connected") 
})
.catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/StayVista");
}

const store = MongoStore.create({
    mongoUrl: "mongodb://127.0.0.1:27017/StayVista",
    crypto : {
        secret : process.env.SECRET_KEY
    },
    touchAfter : 24 * 3600,
});
store.on("error", function(e){
    console.log("Session Store Error", e);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET_KEY,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());  


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});



app.get("/demouser", async(req, res) => {
    let user = new User({
        email : "abc@gmaol.com",
        username : "abc"
    });
    let newUser = await User.register(user, "password");
    res.send(newUser);
});

app.use('/', userRouter);

app.get('/', (req, res) => {
    res.redirect('/listings');
});





const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
 const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

app.get("/listings", asyncWrap(listingController.index));
app.get("/listings/new",isLoggedIn, listingController.newListing );
app.get("/listings/:id/edit",isLoggedIn, asyncWrap(listingController.editListing));
app.put("/listings/:id",isLoggedIn,isOwner, upload.single("image"),validateListing,asyncWrap(listingController.updateListing));
app.delete("/listings/:id",isLoggedIn, asyncWrap(listingController.deleteListing));
app.get('/listings/:id', asyncWrap(listingController.showListing));
app.post("/listings/:id/reviews",isLoggedIn, validateReview,asyncWrap(reviewController.newRev));
app.delete("/listings/:id/reviews/:reviewId",isLoggedIn,isAuthor,asyncWrap(reviewController.deleteRev));
app.post("/listings",isLoggedIn,upload.single("image") ,validateListing,asyncWrap(listingController.createListing));

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    let{statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{ message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});