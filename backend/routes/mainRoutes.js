const express = require("express");
const router = express.Router();
const User = require("../model/user");
const Team = require("../model/team");
const Player = require("../model/player");

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/main", async (req, res) => {
  const username = req.session.username || "Guest";
  const userId = req.user ? req.user._id : null;

  try {
    const teams = userId ? await Team.find({ user: userId }) : [];
    res.json({ name: username, teams: teams });
  } catch (error) {
    console.error("Failed to fetch the user's teams:", error);
    res.status(500).json({ error: "Error fetching teams information" });
  }
});

router.delete("/delete-account/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("userid", userId);

    await User.findByIdAndDelete(userId);

    res.status(200).send("Account successfully deleted");
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).send("Error deleting account");
  }
});

module.exports = router;
