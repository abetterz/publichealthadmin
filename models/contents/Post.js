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
  video: String,
  hide_image: Boolean,
  image: String,
  author: String,
  date_published: String,
  entry_id: String,
  categories: [String],
  screenshot: String,
  screenshot_error: String,
  get_image: String,
  external_link: String,
  downloadable_link: String,
  image: String,
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

module.exports = mongoose.model("Post", TheSchema);
