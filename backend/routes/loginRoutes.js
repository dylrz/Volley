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
// router.post("/login-register", async (req, res) => {
//     try {
//         const {name, email, createusername} = req.body;
//         const createpassword = req.body.createpassword;
//         const createpasswordconfirm = req.body.createpasswordconfirm;

//         if (createpassword !== createpasswordconfirm) {
//         return res.render("login-register", {
//             error: "Passwords do not match", 
//             form: 'signup-form'
//             });
//         }
//         else {
//         let newUser = new User ({
//             name: name,
//             email: email,
//             username: createusername
//         });

//         let registeredUser = await User.register(newUser, createpassword);
//         res.render('login-register', { message: 'Account created successfully. Please log in.' });
//         req.session.username = registeredUser.name;
//         return res.redirect("/login-register");
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).render('login-register', { error: "An error occurred during registration", form: 'register'})
//     }
// });

router.post("/login-register", async (req, res) => {
    try {
        const { name, email, createusername, createpassword, createpasswordconfirm } = req.body;

        if (createpassword !== createpasswordconfirm) {
            // Returning JSON response for password mismatch
            return res.status(400).json({ error: "Passwords do not match" });
        } else {
            let newUser = new User({
                name: name,
                email: email,
                username: createusername
            });

            let registeredUser = await User.register(newUser, createpassword);

            // Sending a success message as JSON
            res.status(201).json({ message: 'Account created successfully. Please log in.', username: registeredUser.name });
        }
    } catch (error) {
        console.error(error);
        // Returning a JSON response for server error
        res.status(500).json({ error: "An error occurred during registration" });
    }
});


// login logic
// router.post("/login", function(req, res, next) {
//     passport.authenticate("local", function(err, user, info) {
//         if (err) {
//         console.error('Authentication error:');
//         return next(err); // this will result in a 500 error
//         }
//         // 'info' contains the feedback from the authentication strategy
//         if (!user) {
//         console.error('Login failed:', info.message);
//         return res.render("login-register", { error: info.message });
//         }
//         req.logIn(user, function(err) {
//         if (err) {
//             console.error('Error logging in:', err);
//             return next(err);
//         }
//         req.session.username = utils.toTitleCase(user.name);
//         res.redirect("/Confirmation");
//         });
//     }) (req, res, next);
// });

router.post("/login", function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            console.error('Authentication error:');
            // Return a JSON response indicating an error
            return res.status(500).json({ error: 'Internal server error' });
        }
        // 'info' contains the feedback from the authentication strategy
        if (!user) {
            console.error('Login failed:', info.message);
            // Return a JSON response indicating login failure
            return res.status(401).json({ error: info.message });
        }
        req.logIn(user, function(err) {
            if (err) {
                console.error('Error logging in:', err);
                // Return a JSON response indicating an error
                return res.status(500).json({ error: 'Error logging in' });
            }
            req.session.username = utils.toTitleCase(user.name);
            req.session.userId = user._id
            res.status(200).json({ message: 'Login successful', username: req.session.username, userId: req.session.userId });
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
        res.redirect('/login-register');
        });
    });
});

module.exports = router;