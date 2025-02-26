const User = require('../models/user');
const passport = require('passport');
const {saveRedirectUrl} = require('../middleware.js');

module.exports.renderSignUp = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signUp = async(req, res) => {
    try{
    let {username, email, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
        if(err){
            return next();
        }
        req.flash('success', 'Welcom to StayVista');
    res.redirect(res.locals.redirectURL);
    });
    
    } catch(e){
        req.flash('error', e.message);
        res.redirect('/signup');
    }
}

module.exports.renderLogIn = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.logIn = async(req, res) => {
    req.flash('success', 'Welcome back');
    let redirectUrl = res.locals.redirectURL || '/listings';
    res.redirect(redirectUrl);
}

module.exports.logOut = (req, res) => {
    req.logout((err) => {
        if(err){
            return next();
        }
        req.flash('success', 'Logged out successfully');
    res.redirect('/listings');
    })
}