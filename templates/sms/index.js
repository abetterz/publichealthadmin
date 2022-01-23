// purchase
const { confirmation, recovery_code } = require("./auth/token");

let dict = {
  // purchases
  confirmation,
  recovery_code,
};

const smsTemplate = (dict_key) => {
  let output = dict[dict_key];
  return output;
};

module.exports = {
  smsTemplate,
};
