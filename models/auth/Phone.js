const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // join relationship
  ip_address: String,
  phone_number: {
    type: String,
  },

  owners: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "profile",
      },
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
    },
  ],
  // restrictions
  suspended: {
    type: Boolean,
    default: false,
  },
  // universal
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

module.exports = mongoose.model("Phone", TheSchema);
