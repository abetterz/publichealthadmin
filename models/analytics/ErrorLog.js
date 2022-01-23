const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // join relationship
  ip_address: String,
  description: String, // describe this action in plain english,

  metadata: {},
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

module.exports = mongoose.model("ErrorLog", TheSchema);
