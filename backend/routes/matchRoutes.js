const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/user");
const Team = require("../model/team");
const Player = require("../model/player");

router.post("/create-tournament", async (req, res) => {
  const { name, teamId } = req.body;
  try {
    const tournament = new Tournament({ name, team: teamId });
    await tournament.save();
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ error: "Error creating tournament" });
  }
});

router.post("/create-match", async (req, res) => {
  const { opponent, startTime, tournamentId } = req.body;
  try {
    const match = new Match({ opponent, startTime, tournament: tournamentId });
    await match.save();
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: "Error creating match" });
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

module.exports = router;
