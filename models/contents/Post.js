const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  // ownership
  title: String,
  link: String,
  hide_image: Boolean,
  image: String,
  author: String,
  date_published: String,
  entry_id: String,
  categories: [String],

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

module.exports = mongoose.model("Post", TheSchema);
