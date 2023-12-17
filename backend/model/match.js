const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Team = require('./team');
const Tournament = require('./tournament');

const matchSchema = new Schema({
    opponentName:  String,
    dateTime: Date,
    matchScore: {
        teamScore: Number,
        opponentScore: Number 
    },
    playerStats: [{ statsID: String }],
    tournament: { type: Schema.Types.ObjectId, ref: 'Tournament'},
    team: { type: Schema.Types.ObjectId, ref: 'Team'},
});

module.exports = mongoose.model('Match', matchSchema);