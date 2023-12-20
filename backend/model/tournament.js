const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");
const Player = require("./player");
const Match = require("./match");
const Team = require("./team");

const tournamentSchema = new Schema({
  tournamentName: String,
  tournamentLocation: String,
  startDate: Date,
  endDate: Date,
  matches: { type: Schema.Types.ObjectId, ref: "Match" },
  team: { type: Schema.Types.ObjectId, ref: "Team" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Tournament", tournamentSchema);
