const express = require("express");
const auth = require("../../middleware/auth");
const { getBody } = require("../../utils/api");
const getModel = require("../../models/index");
const { getPlaceApi } = require("../../public_api/place");

// Google Auth
const router = express.Router();

router.post("/benefits/:model", [auth], async (req, res) => {
  try {
    const { body: BODY, current_place } = req;
    const { model } = req.params;

    let got_body = (await getBody(model, BODY)) || {};

    let payload = {
      ...got_body,
      place: current_place._id,
      user: req.user.id,
    };

    let Model = getModel({ model });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let created = new Model(payload);
    await created.save();

    // let output = await getPlaceApi({ _id: current_place._id });
    let output = await getPlaceApi({ _id: current_place._id });

    res.status(206).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
