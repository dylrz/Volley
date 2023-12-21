const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../model/user");
const Team = require("../model/team");
const Player = require("../model/player");

router.get("/", function (req, res) {
  res.render("index");
});

router.get("/main", async (req, res) => {
  const username = req.session.username || "Guest";
  const name = req.session.name;
  const userId = req.user ? req.user._id : null;

  try {
    const teams = userId ? await Team.find({ user: userId }) : [];
    res.json({ name: name, username: username, teams: teams });
  } catch (error) {
    console.error("Failed to fetch the user's teams:", error);
    res.status(500).json({ error: "Error fetching teams information" });
  }
});

router.delete("/delete-account/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    await User.findByIdAndDelete(userId);

    res.status(200).send("Account successfully deleted");
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).send("Error deleting account");
  }
});

router.post("/change-username/:userId", async (req, res) => {
  const { newUsername } = req.body;
  const userId = req.params.userId;

  try {
    await User.findByIdAndUpdate(userId, { username: newUsername });

    res.status(200).send({ message: "Username changed successfully" });
  } catch (error) {
    console.error("Error changing username: ", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/change-password/:userId", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.authenticate(
      currentPassword,
      async (err, authenticatedUser, passwordErr) => {
        if (err || !authenticatedUser) {
          return res
            .status(400)
            .send({ message: "Current password is incorrect" });
        }

        user.setPassword(newPassword, async (error) => {
          if (error) {
            throw error;
          }
          await user.save();
          res.status(200).send({ message: "Password changed successfully" });
        });
      }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
