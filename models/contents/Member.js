const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  fullname: String,
  email: String,

  published_on: {
    type: Date,
    default: Date.now,
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

module.exports = mongoose.model("Member", TheSchema);
