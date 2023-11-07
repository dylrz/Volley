const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teamSchema = new Schema({
    userID: String,
    teamName:  String, // String is shorthand for {type: String}
    league: String,
    rosterSize: Number,
    players: [{ name: String, number: Number }]
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team