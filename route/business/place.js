const express = require("express");
const auth = require("../../middleware/auth");
const { getBody, getRandomInt } = require("../../utils/api");
const Manager = require("../../models/business/manager");
const Hour = require("../../models/business/Hour");
const Connection = require("../../models/business/Connection");
const File = require("../../models/utils/File");
const {
  smsTransporter,
  emailTransporter,
} = require("../../middleware/message");
const { fixRequestBody } = require("http-proxy-middleware");
const { getPlaceApi } = require("../../public_api/place");

// Google Auth
const router = express.Router();

router.get("/place/isonboard", [auth], async (req, res) => {
  try {
    let published = req.current_place && req.current_place.published;
    let publish_later = req.current_place && req.current_place.publish_later;

    let output = !publish_later && !published;

    console.log(published);

    console.log(output);

    res.status(201).json(output);
  } catch (error) {
    res.status(error.status || 403).json({ message: error.messsage });
  }
});

router.get("/place/my_api", [auth], async (req, res) => {
  try {
    const user_id = req.user && req.user.id;
    const place_id = req.current_place && req.current_place._id;

    let found_manager = await Manager.findOne({
      user: user_id,
      owned: true,
      place: place_id,
    });

    let output = {};
    if (found_manager) {
      output = await getPlaceApi({ _id: found_manager.place });
    }
    res.status(201).json(output);
  } catch (error) {
    res.status(error.status || 403).json({ message: error.messsage });
  }
});

router.post("/place/publish_place", [auth], async (req, res) => {
  try {
    const { published, publish_later } = req.body;
    console.log(published, "testing error");

    let found_place = await Place.findOne({ _id: req.current_place._id });
    found_place.published = published;
    found_place.publish_later = publish_later;
    await found_place.save();
    let output = await getPlaceApi({ _id: found_place._id });

    res.status(201).json(output);
  } catch (error) {
    console.log(error, "testing error");
    res.status(error.status || 403).json({ message: error.messsage });
  }
});

router.post("/place/business_members", [auth], async (req, res) => {
  try {
    const { body, current_place, user } = req;

    if (!body || !body.place) {
      throw { message: "Your must add a business member" };
    }

    // associate place with users
    // check if connection exists
    let connections = await body.place.map(async (receiver) => {
      let connection = await Connection.findOne({
        $or: [
          { "receiver.place": receiver, "sender.place": current_place._id },
          { "sender.place": receiver, "receiver.place": current_place._id },
        ],
      });

      if (!connection) {
        let connection_body = {
          user: user.id,
          sender: {
            place: current_place._id,
            status: "accepted",
          },
          receiver: {
            place: receiver,
          },
        };

        connection = new Connection(connection_body);
        await connection.save();
      } else {
        let dont_reconnect = ["denied", "blocked"];
        let nogo = dont_reconnect.includes(connection.receiver.status);
        if (connection.receiver.place === receiver) {
          // this means that they already received a message from the seller
          // check if the user denied the connection.
          // if user denied the connection or block the connection,
          // we should not removed seen
          if (!nogo) {
            // this means that they already received a message from the seller
            // and we can recoonect
            delete connection.receiver.seen;
            await connection.save();
          }
        } else if (connection.sender.place === receiver) {
          if (!nogo) {
            // this means that they already received a message from the seller
            // and we can recoonect
            delete connection.sender.seen;
            await connection.save();
            connection.receiver.status = "accepted";
          }
        }
      }

      return connection;
    });

    const complete_connections = await Promise.all(connections);

    console.log(complete_connections, "complete_connections");

    let output = await getPlaceApi({ _id: current_place._id });

    res.status(201).json(output);
  } catch (error) {
    res.status(error.status || 403).json({ message: error.messsage });
  }
});

router.post("/place/business_branding", [auth], async (req, res) => {
  let api_key = "business_branding";
  try {
    const { body: BODY } = req;
    let { logo, banner, poster } = (await getBody(api_key, BODY)) || {};

    let current_place = await Place.findOne({ _id: req.current_place._id });
    if (current_place) {
      if (logo) {
        current_place.logo = logo;
        let found = await File.findOne({ _id: logo });
        found.user = req.user.id;
        found.place = req.current_place._id;
        await found.save();
      }
      if (banner) {
        current_place.banner = banner;
        let found = await File.findOne({ _id: banner });
        found.user = req.user.id;
        found.place = req.current_place._id;
        await found.save();
      } else {
        delete current_place.banner;
      }

      if (poster) {
        current_place.poster = poster;
        let found = await File.findOne({ _id: poster });
        found.user = req.user.id;
        found.place = req.current_place._id;
        await found.save();
      } else {
        delete current_place.poster;
      }
      await current_place.save();
      let output = await getPlaceApi({ _id: current_place._id });

      res.status(206).json(output);
    } else {
      throw {
        status: 500,
        message: "Invalid Credentials",
      };
    }
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/place/my_business", [auth], async (req, res) => {
  let api_key = "my_business";
  let confirmation_code = getRandomInt(100001, 999999);

  try {
    const BODY = req.body;
    const user_id = req.user && req.user.id;
    let error_list = [];
    if (!user_id) {
      error_list = [{ message: "Invalid Credentials" }];
      throw {
        status: 403,
        message: { errors: error_list },
      };
    }
    let got_body = (await getBody(api_key, BODY)) || {};
    let place = got_body.my_business && got_body.my_business[0];

    if (place) {
      // check if the user already managed a place
      let found_manager = await Manager.findOne({
        user: user_id,
        owned: true,
      }).populate("place");

      const found_place = await Place.find({ _id: place });

      const body = {
        place,
        user: user_id,
        place_id: found_place._id,
        owned: true,
        place_confirmed: false,
        user_confirmed: true,
        confirmation_code,
      };

      if (
        found_manager &&
        found_manager.place &&
        found_manager.place._id !== place
      ) {
        throw {
          status: 403,
          message: ["You may only own one association under this user"],
        };
      }
      if (!found_manager) {
        found_manager = new Manager(body);
        await found_manager.save();
      } else if (!found_manager.confirmed) {
        found_manager.confirmation_code = confirmation_code;
        await found_manager.save();
      }

      let output = await getPlaceApi({ _id: found_manager.place });

      res.status(201).json(output);
    } else {
      throw {
        status: 403,
        message: ["You must first select a place"],
      };
    }
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/place/business_profile", [auth], async (req, res) => {
  let api_key = "updated_place";

  try {
    const BODY = req.body;
    const user_id = req.user && req.user.id;
    let error_list = [];
    if (!user_id) {
      error_list = [{ message: "Invalid Credentials" }];
      throw {
        status: 403,
        message: { errors: error_list },
      };
    }
    let got_body = (await getBody(api_key, BODY)) || {};

    // check if business exists
    let found_manager = await Manager.findOne({
      user: user_id,
      owned: true,
    });

    let found_place = await Place.findOne({
      _id: found_manager.place,
    }).populate([
      { path: "logo", select: { link: 1, name: 1 } },
      { path: "poster", select: { link: 1, name: 1 } },
      { path: "banner", select: { link: 1, name: 1 } },
    ]);

    const got_keys = Object.keys(got_body);

    got_keys.forEach((key) => {
      found_place[key] = got_body[key];
    });
    found_place.corrected = true;
    await found_place.save();
    // todo: make sure user is adding and editing the correct place
    let place_card = await getBody("place_card", found_place);
    let business_hours = await Hour.find({ place: place_card._id }).sort({
      created_at: -1,
    });
    let onboard_business_hours = await getBody(
      "public_business_hours",
      business_hours
    );

    let output = await getPlaceApi({ _id: found_place._id });

    res.status(206).json(output);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/place/business_hours", [auth], async (req, res) => {
  let api_key = "business_hours";
  try {
    const { body: BODY, current_place } = req;

    let got_body = (await getBody(api_key, BODY)) || {};

    let payload = {
      ...got_body,
      place: current_place._id,
      user: req.user.id,
    };

    let new_time = new Hour(payload);
    await new_time.save();

    let output = await getPlaceApi({ _id: current_place._id });

    res.status(206).json(output);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/place/drop/business_hours", [auth], async (req, res) => {
  let api_key = "business_hours";
  try {
    const { body: BODY, current_place } = req;

    await Hour.findOneAndDelete(BODY);

    let output = await getPlaceApi({ _id: current_place._id });

    res.status(206).json(output);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
