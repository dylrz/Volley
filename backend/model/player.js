const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Team = require('./team');

const playerSchema = new Schema({
    playerName:  String,
    playerNumber: Number,
    position: String,
    playerStats: [{ statsID: String }],
    team: { type: Schema.Types.ObjectId, ref: 'Team'}
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player