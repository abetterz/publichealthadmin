const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // join relationship
  ip_address: String,
  // personal information
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    require: true,
  },

  image: String,
  fullname: String,
  title: String,
  prev_passwords: [
    {
      password: String,
      created_at: {
        type: Date,
        default: Date.now,
      },
      updated_at: {
        type: Date,
      },
    },
  ],
  phone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "phone",
  },
  current_place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  // verification code
  confirmation_code: {
    type: String,
  },
  recovery_token: {
    type: String,
  },
  recovery_token_matches: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model("User", TheSchema);
