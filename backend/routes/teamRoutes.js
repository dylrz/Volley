const express = require('express');
const router = express.Router();
const User = require('../model/user')
const Team = require('../model/team');
const Player = require('../model/player');

router.get('/create-team', (req, res) => {
res.render('create-team');
});

router.post('/create-team', async (req, res) => {
    try {
        req.session.teamInfo = {
        teamName: req.body.teamName,
        league: req.body.league,
        rosterSize: req.body.rosterSize,
        user: req.user._id
        };
        console.log(req.session.teamInfo)
        res.redirect('/player-entry?rosterSize=' + req.body.rosterSize);

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Route to render the player's entry form
router.get('/player-entry', (req, res) => {
    try {
        const rosterSize = req.query.rosterSize || req.session.rosterSize; // Use session or query
        res.render('player-entry', { rosterSize: rosterSize }); // This view will contain the form to input players' details
        console.log(rosterSize)
    } catch (error) {
        console.log(error);
        req.flash('error', 'All fields are required. Please try again.');
        res.status(500).render('create-team', { error: "An error occurred during submission", form: 'teamInfoForm'})
    }
});

router.post('/create-team-finalize', async (req, res) => {
    try {
        // Retrieve the team info
        const teamInfo = req.session.teamInfo;
        if (!teamInfo) {
        console.error('Team information is not available in the session.');
        return res.status(400).send('Session information for team creation is missing.');
        }
        console.log(teamInfo);
        
        // Initialize the team with the data that doesn't depend on the players
        const team = new Team({
        teamName: teamInfo.teamName,
        league: teamInfo.league,
        rosterSize: teamInfo.rosterSize,
        user: teamInfo.user,
        players: [] // Initially empty, we'll fill this in after creating the players
        });

        req.session.newTeamId = team._id;

        // Placeholder for player IDs
        const playerIds = [];

        // Iterate over the player data, create and save each player, and collect their IDs
        for (const playerData of req.body.players) {
        const player = new Player({
            playerName: playerData.playerName,
            playerNumber: playerData.playerNumber,
            position: playerData.position,
            playerStats: playerData.playerStats,
            team: team._id // Set the reference to the team's ID
        });
        const savedPlayer = await player.save(); // Save the player and get the result
        playerIds.push(savedPlayer._id); // Push the player's ID into the array
        }

        // Now that all players are created and we have their IDs, set the team's players array
        team.players = playerIds;
        
        // Finally, save the team with the player references
        await team.save();

        // Clean up the session
        delete req.session.teamInfo;
        
        // Redirect to a success page or send a successful response
        res.redirect('/main');
    } catch (error) {
        console.error('Failed to create team:', error);
        res.status(500).send('Failed to create team.');
    }
});

router.get('/team/:teamId', async (req, res) => {
    try {
        const teamId = req.params.teamId;
        const team = await Team.findById(teamId).populate('players'); // Assuming your Team model has a 'players' field which is an array of ObjectIds referencing the 'Player' model

        if (!team) {
        return res.status(404).send("Team not found");
        }

        res.render('team', {
        team: team // This will have all the team info, including the populated 'players' array
        });
    } catch (error) {
        console.error("Failed to fetch the team details:", error);
        res.status(500).send("Error fetching team details");
    }
});

module.exports = router;