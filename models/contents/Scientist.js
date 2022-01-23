const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  // ownership
  name: String,
  title: String,
  link: String,
  image: String,

  // universal
  public: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model("Scientist", TheSchema);
