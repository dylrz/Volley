const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    teamName:  String, // String is shorthand for {type: String}
    league: String,
    numPlayers: Number,
    players: [{ name: String, number: Number }]
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team