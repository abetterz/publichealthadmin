const dict = {
  register: (payload) => {
    return `This ${payload[0]} (${payload[1]}) is taken.`;
  },
  register_error: (payload) => {
    return `Error: ${payload[0]}`;
  },
};

const translate = function (dict_key, payload) {
  const output = dict[dict_key](payload);
  return output;
};

module.exports = {
  translate,
};
