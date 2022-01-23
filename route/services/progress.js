const express = require("express");

const auth = require("../../middleware/auth");
const { checkErrors } = require("../utils/api");

const Profile = require("../../db/models/Profile");
const Progress = require("../../db/models/users/Progress");
const router = express.Router();
router.get("/:process", [auth], async (req, res) => {
  try {
    let found_profile = await Profile.findOne({
      user: req.user.id,
      current: true,
    });

    // check for progress
    let found_progress = await Progress.findOne({
      profile: found_profile._id,
      process: req.params.process,
    });

    if (found_progress) {
      let state = JSON.parse(found_progress.state);

      res.status(200).json(state);
    } else {
      res.send(null);
    }
  } catch (error) {
    res.status(500).json({ success: false, msg: "error" });
  }
});
router.post("/:process", [auth], async (req, res) => {
  let ip_address = req.connection.remoteAddress;

  try {
    let found_profile = await Profile.findOne({
      user: req.user.id,
      current: true,
    });

    // check for progress
    let found_progress = await Progress.findOne({
      profile: found_profile._id,
      process: req.params.process,
    });
    let state = JSON.stringify(req.body);

    if (found_progress) {
      found_progress.state = state;
      found_progress.ip_address = ip_address;
      found_progress.save();
    } else {
      let payload = {
        profile: found_profile._id,
        state,
        process: req.params.process,
        ip_address,
      };

      let progress = await new Progress(payload);
      await progress.save();
    }

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, msg: "error" });
  }
});

module.exports = router;
