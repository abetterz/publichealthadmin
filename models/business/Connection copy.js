const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  sender: {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
    },
    status: {
      type: String,
      default: "accepted",
    },
    accepted_at: {
      type: Date,
      default: Date.now,
    },
    seen: {
      type: Date,
    },
    public: {
      type: Boolean,
      default: true,
    },
  },
  receiver: {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
    },
    status: {
      type: String,
    },
    accepted_at: {
      type: Date,
    },
    public: {
      type: Boolean,
      default: true,
    },
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

module.exports = mongoose.model("Connection", TheSchema);
