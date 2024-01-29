const express = require("express");
const router = express.Router();
const Match = require("../model/match");
const Set = require("../model/set");
const player = require("../model/player");

router.get("/get-player/:playerId", async (req, res) => {
  const playerId = req.params.playerId;

  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    return res.status(400).send("Invalid player ID");
  }

  try {
    const player = await player.findById(playerId);

    if (!team) {
      return res.status(404).send("Player not found");
    }

    res.json({ player: player });
  } catch (error) {
    console.error("Error fetching player details:", error);
    res.status(500).send("Error fetching player details");
  }
});

module.exports = router;
