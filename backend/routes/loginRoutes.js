const express = require('express');
const router = express.Router();
const passport = require('passport');
const utils = require('../utils');
const User = require('../model/user');
const Team = require('../model/team');
const Player = require('../model/player');
  
  // showing main registration page
router.get("/login-register", function (req, res) {
    res.render("login-register");
});

// handling user signup
router.post("/login-register", async (req, res) => {
    try {
        const {name, email, createusername} = req.body;
        const createpassword = req.body.createpassword;
        const createpasswordconfirm = req.body.createpasswordconfirm;

        if (createpassword !== createpasswordconfirm) {
        return res.render("login-register", {
            error: "Passwords do not match", 
            form: 'signup-form'
            });
        }
        else {
        let newUser = new User ({
            name: name,
            email: email,
            username: createusername
        });

        let registeredUser = await User.register(newUser, createpassword);
        res.render('login-register', { message: 'Account created successfully. Please log in.' });
        req.session.username = registeredUser.name;
        return res.redirect("/login-register");
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('login-register', { error: "An error occurred during registration", form: 'register'})
    }
});

// login logic
router.post("/login", function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
        if (err) {
        console.error('Authentication error:');
        return next(err); // this will result in a 500 error
        }
        // 'info' contains the feedback from the authentication strategy
        if (!user) {
        console.error('Login failed:', info.message);
        return res.render("login-register", { error: info.message });
        }
        req.logIn(user, function(err) {
        if (err) {
            console.error('Error logging in:', err);
            return next(err);
        }
        req.session.username = utils.toTitleCase(user.name);
        res.redirect("/main");
        });
    }) (req, res, next);
});

//handling user logout 
router.get("/logout", function (req, res, next) {
    req.logout(function(err) {
        if (err) {
        console.error('Logout error:', err);
        return next(err);
        }
        // destroy the session after ensuring the logout was successful
        req.session.destroy(function (err) {
        if (err) {
            console.error('Failed to destroy session during logout.', err);
            return next(err);
        }
        // only after destroying the session clear the cookie
        res.clearCookie('connect.sid', { path: '/', httpOnly: true, secure: 'auto', sameSite: 'strict' });
        res.redirect('/');
        });
    });
});

module.exports = router;