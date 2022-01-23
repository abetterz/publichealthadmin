const express = require("express");
const auth = require("../../middleware/auth");
const { getBody } = require("../../utils/api");
const getModel = require("../../models/index");
const { getPlaceApi } = require("../../public_api/place");

// Google Auth
const router = express.Router();

router.post("/:model/create", [auth], async (req, res) => {
  try {
    const BODY = req.body;
    const { model } = req.params;

    let got_body = (await getBody(model, BODY)) || {};

    let payload = {
      ...got_body,
      creator: req.user.id,
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
    let output = created;

    res.status(201).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.get("/:model/read", [auth], async (req, res) => {
  try {
    const BODY = req.body;
    const { model } = req.params;

    let Model = getModel({ model });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let output = await Model.find({});

    res.status(201).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
