const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // ownership
  ip_address: String,
  metadata: {},
  name: String,
  link: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
  access: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "access",
    },
  ],
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

module.exports = mongoose.model("File", TheSchema);
