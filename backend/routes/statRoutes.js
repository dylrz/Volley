const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Match = require("../model/match");
const Set = require("../model/set");
const Player = require("../model/player");
const Stats = require("../model/stats");

router.get("/get-player/:playerId", async (req, res) => {
  const playerId = req.params.playerId;

  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    return res.status(400).send("Invalid player ID");
  }

  try {
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).send("Player not found");
    }

    res.json({ player: player });
  } catch (error) {
    console.error("Error fetching player details:", error);
    res.status(500).send("Error fetching player details");
  }
});

router.post("/update-stats", async (req, res) => {
  const { playerId, matchId, tournamentId, ...statFields } = req.body;

  try {
    let stats = await Stats.findOne({ player: playerId, match: matchId });

    if (stats) {
      let updates = {};

      // Populate the updates object with the fields to increment
      Object.keys(statFields).forEach((key) => {
        if (!isNaN(statFields[key])) {
          updates[key] = (updates[key] || 0) + statFields[key];
        }
      });

      // Save the updated stats document
      const updatedStats = await Stats.findOneAndUpdate(
        { _id: stats._id },
        { $inc: updates }, // Use $inc operator to increment fields
        { new: true, upsert: true }
      );

      return res
        .status(200)
        .json({ message: "Stats updated successfully", stats: updatedStats });
    } else {
      // Create new stats if they don't exist
      const newStats = new Stats({
        player: playerId,
        match: matchId,
        tournament: tournamentId,
        ...statFields,
      });

      const savedStat = await newStats.save();
      return res
        .status(200)
        .json({ message: "New stats created successfully", stats: savedStat });
    }
  } catch (error) {
    console.error("Error updating stats:", error);
    return res.status(500).json({ message: "Failed to update stats", error });
  }
});

router.get("/get-stats/:playerId", async (req, res) => {
  const { playerId } = req.params;

  try {
    // Find all stats documents for the given player ID
    const playerStats = await Stats.find({ player: playerId });

    if (playerStats && playerStats.length > 0) {
      return res.status(200).json({
        message: "Player stats retrieved successfully",
        stats: playerStats,
      });
    } else {
      return res
        .status(404)
        .json({ message: "No stats found for the given player" });
    }
  } catch (error) {
    console.error("Error retrieving player stats:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve player stats", error });
  }
});

module.exports = router;
