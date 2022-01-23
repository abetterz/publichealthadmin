const moment = require("moment");

const sample_product = require("./sample_product_output.json");

const filterShelfByAge = (shelf, age) => {
  let filtered = sample_product.shelf.filter((item) => {
    let go = true;

    // check age range
    if (item.age_range && item.age_range[0]) {
      go = item.age_range.find((range) => {
        return range.minimum <= age && range.maximum <= age;
      });
    }
    return go;
  });

  return filtered;
};

const dateInBetween = (test_date, before, after) => {
  let go;

  // var time = moment() gives you current time. no format required.
  var time = moment(test_date),
    beforeTime = moment(before),
    afterTime = moment(after);

  if (time.isBetween(beforeTime, afterTime)) {
    go = true;
  }
  return go;
};

const filterShelfByDate = (shelf, dates = {}) => {
  let { date_start, date_end } = dates;

  if (!date_start) {
    date_start = Date.now();
  }
  if (!date_end) {
    date_end = date_start;
  }
  let filtered = sample_product.shelf.filter((item) => {
    let go = true;

    // check age range
    if (date_start && item.date_range && item.date_range[0]) {
      go = item.date_range.find((range) => {
        return dateInBetween(date_start, range.date_start, range.date_end);
      });
    }
    return go;
  });

  return filtered;
};

const filterShelfByDiscountCode = (shelf, discount) => {
  let filtered = shelf.filter((item) => {
    let go = true;

    // check age range
    if (discount && discount[0] && item.discount && item.discount[0]) {
      go = item.discount.find((merchant) => {
        return discount.find((mine) => mine == merchant);
      });
    }
    return go;
  });

  return filtered;
};

const getUniqueShelf = (product) => {
  let output = product;
  let shelf = [];
  if (output.shelf && output.shelf[0]) {
    shelf = [...output.shelf];
  }
  if (output.template && output.template[0]) {
    shelf = [...output.template.shelf];
  }
  // make shelf unique based on _id
  shelf = [...new Map(shelf.map((item) => [item["_id"], item])).values()];

  output.shelf = shelf;
  return output;
};

const joinAllShelf = (product) => {
  let output = product;
  let shelf = [];
  if (output.shelf && output.shelf[0]) {
    shelf = [...output.shelf];
  }
  if (output.template && output.template[0]) {
    shelf = [...output.template.shelf];
  }
  // make shelf unique based on _id
  shelf = [...new Map(shelf.map((item) => [item["_id"], item])).values()];

  output.shelf = shelf;
  return output;
};

const joinShelfKeys = (product) => {
  let output = { ...product };

  let new_shelf = {
    // age_range: [],
    // date_range: [],
    // day_range: [],
    discount: [],
    pricing: [],
    quantity: [],
    rename: [],
    time_range: [],
    wholesale: [],
    // detail
    description: [],
    faq: [],
    gallery: [],
    files: [],
    // option
    option: [],
    question: [],
    size: [],
    upload: [],
    // association
    featured_staff: [],
    brand: [],
    location: [],
    fullfiller: [],
    supplier: [],
  };
  let new_shelf_keys = Object.keys(new_shelf);

  if (output.shelf && output.shelf[0]) {
    output.shelf.forEach((item) => {
      new_shelf_keys.forEach((key) => {
        let item_keyed = item[key];
        if (item_keyed) {
          let new_payload = [...new_shelf[key], ...item_keyed];
          new_shelf[key] = new_payload;
        }
      });
    });
    output.shelf = new_shelf;
  }
  // output.new_shelf = new_shelf;

  return output;
};

const productOptionAi = (product, user_agent) => {
  let output = product;
  if (product && product.shelf && product.shelf.option) {
    output.shelf.option = output.shelf.option.map((option) => {
      let new_option = option;
      new_option.product = new_option.product.map((item) => {
        //todo: return this v
        // return formatProductForFrontend(option, user_agent, { cdo: false });
        return item;
      });
      return new_option;
    });
  }
  return output;
};

const formatProductForFrontend = (product, user_agent = {}, config) => {
  let output = product;

  // filter shelf based on user_agent
  // let shelf = filterShelfByAge(payload.shelf, user_agent.age);
  // // shelf = filterShelfByDate(shelf, user_agent.date_range);

  // if (!config || !config.cdo) {
  output = getUniqueShelf(output, user_agent);
  output = joinAllShelf(output);
  output = joinShelfKeys(output);
  // }
  // if (!config || !config.options) {
  //   // output = productOptionAi(output);
  // }

  // if (config && config.resolve) {
  //   config.resolve(output);
  // }

  return output;
};

module.exports = {
  formatProductForFrontend,
};
