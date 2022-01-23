const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // join relationship
  ip_address: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  // personal information
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  dob: {
    type: String,
  },
  icon: String,
  banner: String,
  poster: String,
  // all items
  self: {
    type: Boolean,
    default: false,
  },
  current_place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "place",
  },

  // authentications
  suspended: Boolean,
  admin: Boolean,
  // universal
  current: {
    type: Boolean,
    default: false,
  },
  public: {
    type: Boolean,
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

module.exports = mongoose.model("Profile", TheSchema);
