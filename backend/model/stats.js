const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Player = require("./player");

const statsSchema = new Schema({
  player: { type: Schema.Types.ObjectId, ref: "Player" },
  match: { type: Schema.Types.ObjectId, ref: "Match" },
  tournament: { type: Schema.Types.ObjectId, ref: "Tournament" },

  currentScore: { type: Number, default: 0 },
  opponentScore: { type: Number, default: 0 },

  attackAttempts: { type: Number, default: 0 },
  totalKills: { type: Number, default: 0 },
  attackOutError: { type: Number, default: 0 },
  attackBlocked: { type: Number, default: 0 },

  passAttempts: { type: Number, default: 0 },
  passRatings: { type: Number, default: 0 },

  serveAttempts: { type: Number, default: 0 },
  serveAces: { type: Number, default: 0 },
  serveErrors: { type: Number, default: 0 },

  blockAttempts: { type: Number, default: 0 },
  blockStuffs: { type: Number, default: 0 },
  blockTouches: { type: Number, default: 0 },

  digAttempts: { type: Number, default: 0 },
  digsMade: { type: Number, default: 0 },

  setAttempts: { type: Number, default: 0 },
  setAssists: { type: Number, default: 0 },
  ballHandlingErrors: { type: Number, default: 0 },
});

const Stats = mongoose.model("Stats", statsSchema);

module.exports = Stats;
