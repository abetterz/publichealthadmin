const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // join relationship
  ip_address: String,
  // personal information
  public_key: {
    type: String,
  },
  private_key: {
    type: String,
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },

  // restrictions
  suspended: {
    type: Boolean,
    default: false,
  },
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

module.exports = mongoose.model("Access", TheSchema);
