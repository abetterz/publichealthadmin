const express = require("express");

const auth = require("../../middleware/auth");
const { checkErrors } = require("../utils/api");

const Profile = require("../../db/models/Profile");
const Config = require("../../db/models/business/Config");
const router = express.Router();
router.get("/:for", [auth], async (req, res) => {
  try {
    let found_profile = await Profile.findOne({
      user: req.user.id,
      current: true,
    });

    // check for progress
    let found_config = await Config.findOne({
      owner: found_profile.current_place,
      for: req.params.for,
    });

    if (found_config) {
      let state = JSON.parse(found_config.state);

      res.status(200).json(state);
    } else {
      res.send({});
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: "error" });
  }
});
router.post("/:for", [auth], async (req, res) => {
  let ip_address = req.connection.remoteAddress;

  try {
    let found_profile = await Profile.findOne({
      user: req.user.id,
      current: true,
    });

    // check for progress
    let found_config = await Config.findOne({
      owner: found_profile.current_place,
      for: req.params.for,
    });
    let state = JSON.stringify(req.body);

    if (found_config) {
      found_config.state = state;
      found_config.ip_address = ip_address;
      found_config.save();
    } else {
      let payload = {
        profile: found_profile._id,
        creator: found_profile._id,
        owner: found_profile.current_place,
        state,
        for: req.params.for,
        ip_address,
      };

      let progress = await new Config(payload);
      await progress.save();
    }

    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({ success: false, msg: "error" });
  }
});

module.exports = router;
