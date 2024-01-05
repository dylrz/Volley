const express = require("express");
const router = express.Router();
const passport = require("passport");
const utils = require("../utils");
const User = require("../model/user");
const Team = require("../model/team");
const Player = require("../model/player");

router.get("/login-register", function (req, res) {
  res.render("login-register");
});

router.post("/login-register", async (req, res) => {
  try {
    const {
      name,
      email,
      createusername,
      createpassword,
      createpasswordconfirm,
    } = req.body;

    const existingUserByEmail = await User.findOne({ email: email });
    const existingUserByUsername = await User.findOne({
      username: createusername,
    });

    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username already in use" });
    }

    if (createpassword !== createpasswordconfirm) {
      return res.status(400).json({ error: "Passwords do not match" });
    } else {
      let newUser = new User({
        name: name,
        email: email,
        username: createusername,
      });

      let registeredUser = await User.register(newUser, createpassword);

      res.status(201).json({
        message: "Account created successfully. Please log in.",
        username: registeredUser.name,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.error("Authentication error:");

      return res.status(500).json({ error: "Internal server error" });
    }

    if (!user) {
      console.error("Login failed:", info.message);

      return res.status(401).json({ error: info.message });
    }
    req.logIn(user, function (err) {
      if (err) {
        console.error("Error logging in:", err);
        return res.status(500).json({ error: "Error logging in" });
      }
      req.session.name = user.name;
      req.session.username = user.username;
      req.session.userId = user._id;
      res.status(200).json({
        message: "Login successful",
        username: req.session.username,
        userId: req.session.userId,
      });
    });
  })(req, res, next);
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }
    req.session.destroy(function (err) {
      if (err) {
        console.error("Failed to destroy session during logout.", err);
        return next(err);
      }
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: "auto",
        sameSite: "strict",
      });
      res.redirect("/login-register");
    });
  });
});

module.exports = router;
