const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // join relationship
  ip_address: String,
  model: String, // the model this action belongs
  model_id: String, // the model id this action belongs
  crud: String, // create, read, update, or delete,
  // which profile did this or was created while taken this action
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
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

module.exports = mongoose.model("Action", TheSchema);
