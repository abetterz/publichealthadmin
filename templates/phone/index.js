// purchase
const batch_receipt = require("./purchase/batch_receipt");
const new_order_delivery_service = require("./purchase/new_order_delivery_service");
const order_on_the_way = require("./purchase/order_on_the_way");
const new_order_unclaimed_store_contact = require("./purchase/new_order_unclaimed_store_contact");
const new_order_unclaimed_store = require("./purchase/new_order_unclaimed_store");
const new_order_unclaimed_store_admin = require("./purchase/new_order_unclaimed_store_admin");

let dict = {
  // purchases
  batch_receipt,
  order_on_the_way,
  new_order_delivery_service,
  new_order_unclaimed_store_contact,
  new_order_unclaimed_store_contact,
  new_order_unclaimed_store,
  new_order_unclaimed_store_admin,
};

const smsTemplate = (dict_key, data = {}) => {
  let output = dict[dict_key];
  return output;
};

module.exports = {
  smsTemplate,
};
