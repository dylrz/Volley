const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Player = require("./player");

const statsSchema = new Schema({
  player: { type: Schema.Types.ObjectId, ref: "Player" },
  match: { type: Schema.Types.ObjectId, ref: "Match" },
  tournament: { type: Schema.Types.ObjectId, ref: "Tournament" },

  attackAttempts: Number,
  totalKills: Number,
  attackOutError: Number,
  attackBlocked: Number,

  passAttempts: Number,
  passRatings: Number,

  serveAttempts: Number,
  serveAces: Number,
  serveErrors: Number,

  blockAttempts: Number,
  blockStuffs: Number,
  blockTouches: Number,

  digAttempts: Number,
  digsMade: Number,

  setAttempts: Number,
  setAssists: Number,
  ballHandlingErrors: Number,
});

const Stats = mongoose.model("Stats", statsSchema);

module.exports = Stats;
