const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/user");
const Team = require("../model/team");
const Player = require("../model/player");
const Tournament = require("../model/tournament");
const Match = require("../model/match");

router.post("/create-tournament", async (req, res) => {
  const { tournamentName, tournamentLocation, startDate, endDate, userId } =
    req.body;
  try {
    const tournament = new Tournament({
      tournamentName,
      tournamentLocation,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      user: userId,
    });

    await tournament.save();

    res.status(201).json(tournament);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating tournament" });
  }
});

router.get("/tournaments", async (req, res) => {
  try {
    const tournaments = await Tournament.find({});
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tournaments" });
  }
});

router.post("/create-match", async (req, res) => {
  const { opponentName, dateTime, tournamentId, teamId } = req.body;

  try {
    const match = new Match({
      opponentName,
      dateTime: new Date(dateTime),
      matchScore: {
        teamScore: 0, // Default score
        opponentScore: 0, // Default score
      },
      tournament: tournamentId,
      team: teamId,
    });

    await match.save();

    res.status(201).json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating match" });
  }
});

router.get("/match/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching match" });
  }
});

router.get("/matches", async (req, res) => {
  try {
    const matches = await Match.find({});
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Error fetching matches" });
  }
});

module.exports = router;
