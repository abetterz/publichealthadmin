const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // ownership
  ip_address: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },

  // data
  days: [String],
  time_start: String,
  time_end: String,
  date_start: String,
  date_end: String,
  notes: String,

  // universal
  public: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
});

module.exports = mongoose.model("Threshold", TheSchema);
