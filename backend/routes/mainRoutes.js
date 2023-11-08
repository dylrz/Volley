const express = require('express');
const router = express.Router();
const User = require('../model/user')
const Team = require('../model/team');
const Player = require('../model/player');

router.get("/", function (req, res) {
    res.render("index")
});

router.get('/main', async (req, res) => {
    const username = req.session.username || 'Guest';
  
    // Assuming req.user is the authenticated user object added by Passport.js
    const userId = req.user ? req.user._id : null;
  
    try {
      // Fetch all teams associated with the user
      const teams = userId ? await Team.find({ user: userId }) : [];
  
      // Render the main page with the teams
      res.render('main', {
        name: username,
        teams: teams // Pass all the user's teams to the main page template
      });
    } catch (error) {
      console.error("Failed to fetch the user's teams:", error);
      res.status(500).send("Error fetching teams information");
    }
  });

  module.exports = router;