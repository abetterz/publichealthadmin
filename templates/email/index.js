const Confirmation = require("../emails/confirmation");
const PasswordReset = require("./password_reset");
const UserSettings = require("./user_settings");
const business_associates = require("./business_associates");
const settings_changes = require("./settings_changes");
const first_class = require("./first_class");
const login = require("./login");
const password_reset_success = require("./password_reset_success");
const job_action = require("./job_action");
// purchase
const batch_receipt = require("./purchase/batch_receipt");
const new_order_delivery_service = require("./purchase/new_order_delivery_service");
const order_on_the_way = require("./purchase/order_on_the_way");
const new_order_unclaimed_store_contact = require("./purchase/new_order_unclaimed_store_contact");
const new_order_unclaimed_store = require("./purchase/new_order_unclaimed_store");
const new_order_unclaimed_store_admin = require("./purchase/new_order_unclaimed_store_admin");

let dict = {
  confirmation: Confirmation,
  password_reset: PasswordReset,
  user_settings: UserSettings,
  business_associates,
  settings_changes,
  first_class,
  login,
  password_reset_success,
  job_action,
  // purchases
  batch_receipt,
  order_on_the_way,
  new_order_delivery_service,
  new_order_unclaimed_store_contact,
  new_order_unclaimed_store_contact,
  new_order_unclaimed_store,
  new_order_unclaimed_store_admin,
};

const template = (dict_key, data = {}) => {
  let output = dict[dict_key];
  return output;
};

module.exports = {
  template,
};
