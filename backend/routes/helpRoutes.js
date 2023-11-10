const express = require('express');
const router = express.Router();
const User = require('../model/user')
const Team = require('../model/team');
const Player = require('../model/player');

router.get('/main-help', (req, res) => {
    res.render('help-docs/main-help');
});

module.exports = router;