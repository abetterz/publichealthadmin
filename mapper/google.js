const googlePlaceMapper = ({ body }) => {
  let output = {};

  const keys = [
    "name",
    "place_id",
    "business_status",
    "formatted_address",
    "international_phone_number",
    "icon",
    "types",
    "website",
    [
      {
        key: "geometry",
        callback: googleGeoMapper,
      },
      {
        key: "opening_hours",
        callback: googleHourMapper,
      },
    ],
  ];

  keys.forEach((key) => {
    if (Array.isArray(key)) {
      key.forEach((obj) => {
        if (obj.key && obj.callback) {
          output[obj.key] = obj.callback(body[obj.key]);
        }
      });
    } else {
      output[key] = body[key];
    }
  });

  return output;
};

const googleGeoMapper = (obj) => {
  return obj;
};
const googleHourMapper = (obj) => {
  return obj;
};

module.exports = {
  google_place_mapper: googlePlaceMapper,
};
