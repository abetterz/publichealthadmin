const confirmation = require("./confirmation");
const recovery_code = require("./recovery_code");
let dict = {
  confirmation,
  recovery_code,
};

const emailTemplate = (dict_key, data = {}) => {
  let output = dict[dict_key];
  return output;
};

module.exports = {
  emailTemplate,
};
