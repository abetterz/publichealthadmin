const { OrderDetailTextExtrator } = require("../../snippets/sms");
const BatchReceipt = (payload) => {
  const {
    title,
    claim_account_link,
    clicks,
    batch_id,
    merchant_name,
    place_id,
    // universal
    site_link,
    help_text,
    follow,
    copyright,
    unsubscribe,
    phone,
    email,
  } = payload || {};

  const product_detail = OrderDetailTextExtrator(clicks);

  return `Unclaimed. Batch ${batch_id} for ${merchant_name} - ${place_id}. Order Detail: ${product_detail} `;
};

module.exports = BatchReceipt;
