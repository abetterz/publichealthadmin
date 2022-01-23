const mongoose = require("mongoose");
const pointSchema = require("../utils/Point");

const PlaceSchema = new mongoose.Schema({
  point: { type: pointSchema },
  // from body
  name: String,
  place_id: String,
  business_status: String,
  formatted_address: String,
  international_phone_number: String,
  icon: String,
  types: [String],
  website: String,

  // additionals
  claimed: {
    type: Boolean,
    default: false,
  },
  corrected: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },

  // branding
  logo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
  banner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
  GeolocationPositionError: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },

  // auto
  searched: [
    {
      profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
      },
      source: String,

      created_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // universal

  created_at: {
    type: Date,
    default: Date.now,
  },
  public: {
    type: Boolean,
    default: true,
  },
  published: {
    type: Boolean,
    default: false,
  },
  publish_later: {
    type: Boolean,
    default: false,
  },
  updated_at: {
    type: Date,
  },
});

PlaceSchema.index({ point: "2dsphere" });

module.exports = Place = mongoose.model("Place", PlaceSchema);
