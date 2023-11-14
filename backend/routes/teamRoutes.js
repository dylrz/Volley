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


router.get('/player-entry', (req, res) => {
    try {
        const rosterSize = req.query.rosterSize || req.session.rosterSize; // use session or query
        res.render('player-entry', { rosterSize: rosterSize });
    } catch (error) {
        console.log(error);
        req.flash('error', 'All fields are required. Please try again.');
        res.status(500).render('create-team', { error: "An error occurred during submission", form: 'teamInfoForm'})
    }
});

router.post('/create-team-finalize', async (req, res) => {
    try {
        // retrieve team info
        const teamInfo = req.session.teamInfo;
        if (!teamInfo) {
        console.error('Team information is not available in the session.');
        return res.status(400).send('Session information for team creation is missing.');
        }
        
        const team = new Team({
        teamName: teamInfo.teamName,
        league: teamInfo.league,
        rosterSize: teamInfo.rosterSize,
        user: teamInfo.user,
        players: []
        });

        req.session.newTeamId = team._id;

        // placeholder for player IDs
        const playerIds = [];

        // create and save each player, and collect their IDs
        for (const playerData of req.body.players) {
        const player = new Player({
            playerName: playerData.playerName,
            playerNumber: playerData.playerNumber,
            position: playerData.position,
            playerStats: playerData.playerStats,
            team: team._id
        });
        const savedPlayer = await player.save(); 
        playerIds.push(savedPlayer._id); // push the player's ID into the array
        }

        // set the team's players array
        team.players = playerIds;
        
        await team.save();

        // Clean up the session
        delete req.session.teamInfo;

        res.redirect('/main');
    } catch (error) {
        console.error('Failed to create team:', error);
        res.status(500).send('Failed to create team.');
    }
});

router.get('/team/:teamId', async (req, res) => {
    try {
        const teamId = req.params.teamId;
        console.log("Received teamId:", teamId);
        const team = await Team.findById(teamId).populate('players');

        if (!team) {
        return res.status(404).send("Team not found");
        }

        res.render('team', {
        team: team // this will have all the team info, including the populated 'players' array
        });
    } catch (error) {
        console.error("Failed to fetch the team details:", error);
        res.status(500).send("Error fetching team details");
    }
});

router.delete('/delete-team/:teamId', async (req, res) => {
    try {
        const teamId = req.params.teamId;
        // delete using the team ID
        await Team.findByIdAndDelete(teamId);
        await Player.deleteMany({ team: teamId });
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Error deleting team:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/edit-team/:teamId', async (req, res) => {
    try {
        const teamId = req.params.teamId;
        console.log("Received teamId:", teamId);
        const team = await Team.findById(teamId).populate('players');

        if (!team) {
            return res.status(404).send('Team not found')
        }
        res.render('edit-team', { team })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error loading the edit page')
    }
});

router.post('/update-team/:teamId', async (req, res) => {
    try {
        const teamId = req.params.teamId;
        const { teamName, playerNames, playerNumbers, playerPositions, playerIds } = req.body;

        await Team.findByIdAndUpdate(teamId, { teamName });

        if (Array.isArray(playerIds) && playerIds.length === playerNames.length &&
            playerIds.length === playerNumbers.length && playerIds.length === playerPositions.length) {
            // update each player
            for (let i = 0; i < playerIds.length; i++) {
                await Player.findByIdAndUpdate(playerIds[i], {
                    playerNumber: playerNumbers[i],
                    playerName: playerNames[i],
                    position: playerPositions[i]
                });
            }
        }

        res.redirect('/main');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating the team');
    }
});

module.exports = router;