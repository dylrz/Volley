const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../model/user')
const Team = require('../model/team');
const Player = require('../model/player');

module.exports = router;