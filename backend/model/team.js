const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");
const Player = require("./player");

const teamSchema = new Schema({
  teamName: String,
  league: String,
  players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Team", teamSchema);
