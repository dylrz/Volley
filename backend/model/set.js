const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Team = require("./team");
const Tournament = require("./tournament");
const Match = require("./match");
const Player = require("./player");

const setSchema = new Schema({
  opponentName: String,
  setScore: {
    teamScore: Number,
    opponentScore: Number,
  },
  lineup: [
    {
      player: { type: Schema.Types.ObjectId, ref: "Player" },
      position: String,
    },
  ],
  match: { type: Schema.Types.ObjectId, ref: "Match" },
  setNumber: Number,
});

module.exports = mongoose.model("MatchSet", setSchema);
