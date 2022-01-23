const OrderDetailTextExtrator = (clicks = []) => {
  let output = "";
  clicks.forEach((click) => {
    const { selected } = click || {};
    let variations = {};
    selected.options &&
      selected.options.forEach((option) => {
        let option_row = `---(${option.qty}) ${option.sold_product_name}`;
        if (variations[option.sold_option_name]) {
          variations[option.sold_option_name] += option_row;
        } else {
          let option_name = `-- ${option.sold_option_name}`;

          variations[option.sold_option_name] = option_name + option_row;
        }
      });
    let values = Object.values(variations);
    let options = values.join();

    let product_row = `-(${selected && selected.qty}) ${
      selected && selected.rename
    }${options}`;

    output += product_row;
  });

  return output;
};

module.exports = {
  OrderDetailTextExtrator,
};
