require("dotenv").config();
const { apiMapper } = require("../mapper");
const Place = require("../models/business/Place");
const Profile = require("../models/auth/Profile");
const { getBody } = require("../utils/api");

module.exports = async (req, res, next = (f) => f) => {
  // Get token from header
  let places = req.body.places;
  if (places && places[0]) {
    let place_loop = places.map(async (place) => {
      let body = JSON.parse(place);
      let payload = {};
      let found_profile;
      let user_id = req.user.id;
      if (user_id) {
        found_profile = await Profile.findOne({ user: user_id });
        if (found_profile) {
          payload.creator = found_profile._id;
        }
      }
      let formatted_place = apiMapper({
        key: "google_place_mapper",
        body,
      });
      let got_body = await getBody(
        req.body.mapper_key || "place_id",
        formatted_place,
        null,
        { add: payload }
      );

      // search the place
      let found_place = await Place.findOne({
        place_id: got_body.place_id,
      });

      if (!found_place) {
        found_place = new Place(got_body);
        await found_place.save();
      }

      if (found_profile) {
        if (!found_place.searched || !found_place.searched[0]) {
          found_place.searched = [];
        }
        let searched_payload = {
          profile: found_profile._id,
          source: "customer",
        };

        found_place.searched.push(searched_payload);
        await found_place.save();
      }
      return found_place;
    });

    let output = await Promise.all([...place_loop]);

    req.body.places = output && output[0] && output;
  }

  next();
};
