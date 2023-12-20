const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../model/user");
const Team = require("../model/team");
const Player = require("../model/player");

router.get("/create-team", (req, res) => {
  res.render("create-team");
});

router.post("/create-team", async (req, res) => {
  try {
    req.session.teamInfo = {
      teamName: req.body.teamName,
      league: req.body.league,
      rosterSize: req.body.rosterSize,
      user: req.user._id,
    };
    res.redirect("/player-entry?rosterSize=" + req.body.rosterSize);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.get("/player-entry", (req, res) => {
  try {
    const rosterSize = req.query.rosterSize || req.session.rosterSize; // use session or query
    res.render("player-entry", { rosterSize: rosterSize });
  } catch (error) {
    console.log(error);
    req.flash("error", "All fields are required. Please try again.");
    res.status(500).render("create-team", {
      error: "An error occurred during submission",
      form: "teamInfoForm",
    });
  }
});

router.post("/create-team-finalize", async (req, res) => {
  try {
    const { finalTeamInfo, players } = req.body;
    if (!finalTeamInfo) {
      console.error("Team information is not provided.");
      return res.status(400).json({ message: "Team information is missing." });
    }

    // Create a new team
    const team = new Team({
      teamName: finalTeamInfo.teamName,
      league: finalTeamInfo.league,
      rosterSize: finalTeamInfo.rosterSize,
      players: [],
      user: finalTeamInfo.userId,
    });
    console.log(finalTeamInfo);

    // Save the team to get its ID
    const savedTeam = await team.save();

    // Placeholder for player IDs
    const playerIds = [];

    // Create and save each player, and collect their IDs
    for (const playerData of players) {
      const player = new Player({
        playerName: playerData.playerName,
        playerNumber: playerData.playerNumber,
        position: playerData.position,
        playerStats: playerData.playerStats,
        team: savedTeam._id,
      });
      const savedPlayer = await player.save();
      playerIds.push(savedPlayer._id); // push the player's ID into the array
    }

    // Update the team's players array with the saved player IDs
    savedTeam.players = playerIds;
    await savedTeam.save();

    // Respond with success message or team data
    res.status(200).json({
      success: true,
      message: "Team created successfully",
      teamId: savedTeam._id,
    });
  } catch (error) {
    console.error("Failed to create team:", error);
    res.status(500).json({ success: false, error: "Failed to create team." });
  }
});

router.get("/team/:teamId", async (req, res) => {
  const teamId = req.params.teamId;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res.status(400).send("Invalid team ID");
  }

  try {
    const team = await Team.findById(teamId).populate("players");

    if (!team) {
      return res.status(404).send("Team not found");
    }

    res.json({ team: team });
  } catch (error) {
    console.error("Error fetching team details:", error);
    res.status(500).send("Error fetching team details");
  }
});

router.delete("/delete-team/:teamId", async (req, res) => {
  try {
    const teamId = req.params.teamId;
    await Team.findByIdAndDelete(teamId);
    await Player.deleteMany({ team: teamId });
    res.status(200).send({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).send("Internal Server Error");
  }
});

// this is called twice
// creates innocuous error, but may need to be fixed in the future
router.get("/edit-team/:teamId", async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const team = await Team.findById(teamId).populate("players");

    if (!team) {
      return res.status(404).send("Team not found");
    }
    res.render("edit-team", { team });
  } catch (error) {
    res.status(500).send("Error loading the edit page");
  }
});

router.post("/update-team/:teamId", async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { teamName, playerData } = req.body;

    await Team.findByIdAndUpdate(teamId, { teamName });

    const updates = playerData
      .filter((player) => player._id)
      .map((player) => {
        return Player.findByIdAndUpdate(player._id, {
          playerName: player.playerName,
          playerNumber: player.playerNumber,
          position: player.position,
          playerStats: player.playerStats,
          team: teamId,
        });
      });

    const newPlayers = playerData
      .filter((player) => !player._id)
      .map((player) => {
        return {
          playerName: player.playerName,
          playerNumber: player.playerNumber,
          position: player.position,
          playerStats: player.playerStats,
          team: teamId,
        };
      });

    await Promise.all(updates);
    if (newPlayers.length > 0) {
      await Player.create(newPlayers);
    }

    res.status(200).send("Team updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating the team");
  }
});

module.exports = router;
