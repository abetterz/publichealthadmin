const { google_place_mapper } = require("./google");

let dict = {
  google_place_mapper,
};

const apiMapper = ({ key, body }) => {
  let func = dict[key];

  let output = func({ key, body });

  return output;
};

module.exports = {
  apiMapper,
};
