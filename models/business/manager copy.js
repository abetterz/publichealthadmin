const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
  internal_user_id: {
    type: String,
  },
  positions: [
    {
      type: String,
    },
  ],
  place_id: {
    type: String,
  },
  owned: {
    type: Boolean,
    default: false,
  },
  place_confirmed: {
    type: Boolean,
    default: false,
  },
  user_confirmed: {
    type: Boolean,
    default: false,
  },

  access_type: [String],
  confirmation_code: String,

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

module.exports = mongoose.model("Manager", TheSchema);
