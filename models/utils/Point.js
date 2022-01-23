const mongoose = require("mongoose");
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: "Point"
  },
  coordinates: {
    type: [Number],
    index: "2dsphere",
    required: true
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "place",
  },
});


module.exports = pointSchema