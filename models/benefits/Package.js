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
  price: Number,
  payments: Number,
  full_payment_discount: Number,
  type: String,
  invite_only: Boolean,
  total: Number,
  representatives: Number,
  description: Number,
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },

  social_media_postings: Number,
  m2m_emails: Number,
  member_newsletter: Number,
  product_listing: Number,
  listing_categories: Number,
  complimentary_events: Number,
  job_postings: Number,
  business_reviews: Number,
  press_releases: Number,
  total_representations: Number,
  logo_at_event: Number,

  direct_messages: Boolean,
  dedicated_manager: Boolean,
  company_profile: Boolean,
  sponsorship: Boolean,
  advertisement: Boolean,
  speaker: Boolean,
  hall_of_fame: Boolean,
  town_halls: Boolean,
  customized: String,

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

module.exports = mongoose.model("Package", TheSchema);
