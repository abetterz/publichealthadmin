const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // ownership
  ip_address: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },

  // data
  title: String,
  qty: Number,
  low_salary: Number,
  high_salary: Number,
  categories: [String],
  qualifications: [String],
  benefits: [String],
  experience: [String],
  level: String,
  invite_only: Boolean,
  type: [String],
  description: String,
  responsibilities: String,
  additional_info: [String],

  public_files: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
  private_files: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
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

module.exports = mongoose.model("Job", TheSchema);
