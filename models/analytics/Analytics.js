const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  user:Object,
  email:String,
  logincount: {
    type: Number,
    default: 1,
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  changesMade: {
    type: Number,
    default: 0,
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
  }
});

module.exports = mongoose.model("Analytics", TheSchema);
