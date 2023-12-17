const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Team = require('./team');
const Tournament = require('./tournament');
const Match = require('./match')

const matchSchema = new Schema({
    setScore: {
        teamScore: Number,
        opponentScore: Number 
    },
    lineup: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    match: { type: Schema.Types.ObjectId, ref: 'Match'}
});

module.exports = mongoose.model('Match', matchSchema);