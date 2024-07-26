const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Team = require("./team");
const Stats = require("./stats");

const playerSchema = new Schema({
  playerName: String,
  playerNumber: Number,
  position: String,
  playerStats: [{ type: Schema.Types.ObjectId, ref: "PlayerStats" }],
  team: { type: Schema.Types.ObjectId, ref: "Team" },
});

module.exports = mongoose.model("Player", playerSchema);
