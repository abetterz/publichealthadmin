const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "google",

  // Optional depending on the providers
  // fetch: customFetchImplementation,
  apiKey: process.env.GOOGLE_PLACE_ID, // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

const geocodeLookup = async (obj = { lat: 45.767, lon: 4.833 }) => {
  let { lat, lon } = obj;
  const res = await geocoder.reverse({ lat, lon });
  return res;
};

module.exports = {
  geocodeLookup,
};
