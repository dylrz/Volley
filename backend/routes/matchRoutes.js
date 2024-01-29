const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/user");
const Team = require("../model/team");
const Player = require("../model/player");
const Tournament = require("../model/tournament");
const Match = require("../model/match");
const MatchSet = require("../model/set");

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
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }
    const tournaments = await Tournament.find({ user: userId });
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
        teamScore: 0,
        opponentScore: 0,
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
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }
    const tournaments = await Tournament.find({ user: userId }).select("_id");
    const tournamentIds = tournaments.map((t) => t._id);

    const matches = await Match.find({ tournament: { $in: tournamentIds } });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Error fetching matches" });
  }
});

router.get("/match/:matchId/sets", async (req, res) => {
  try {
    const matchId = req.params.matchId;
    const sets = await MatchSet.find({ match: matchId }).populate("lineup");
    res.json(sets);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/create-set", async (req, res) => {
  try {
    const newSet = new MatchSet(req.body);
    await newSet.save();
    res.status(201).send(newSet);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.get("/set/:setId", async (req, res) => {
  try {
    const setId = req.params.setId;
    const set = await MatchSet.findById(setId);
    res.json(set);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/set/save-lineup/:setId", async (req, res) => {
  try {
    const setId = req.params.setId;
    const lineupData = req.body.lineup; // Expecting an array of objects [{ player: playerID, position: positionLabel }, ...]

    const set = await MatchSet.findById(setId);

    if (!set) {
      return res.status(404).send("Set not found");
    }

    // Validate and transform the lineupData if necessary
    const transformedLineup = lineupData.map((entry) => {
      return {
        player: new mongoose.Types.ObjectId(entry.player),
        position: entry.position,
      };
    });

    set.lineup = transformedLineup;

    await set.save();

    res.status(200).send(set);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
