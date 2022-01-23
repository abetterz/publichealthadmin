const express = require("express");
const auth = require("../../middleware/auth");
const { getBody } = require("../../utils/api");
const getModel = require("../../models/index");
const { getPlaceApi } = require("../../public_api/place");

// Google Auth
const router = express.Router();
const { data } = require("../../test");

router.post("/posts/data", [auth], async (req, res) => {
  try {
    let Model = getModel({ model: "posts" });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    console.log("posted data");
    let created = await Model.insertMany(data);
    let output = created;

    res.status(201).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

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

router.get("/:model/read", async (req, res) => {
  try {
    const BODY = req.body;
    const { model } = req.params;
    const { category, type } = req.query;

    let Model = getModel({ model });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let dict = {
      exclusive: ["exclusive", "top_stories"],
      must_read: ["must_read"],
      updated_daily: ["updated_daily"],
      featured_story: ["featured_story"],
    };

    let got_category = dict[category];

    console.log(category);

    let output = [];
    if (got_category) {
      let query = {
        categories: { $in: got_category },
      };

      console.log(type);
      if (!type) {
        output = await Model.find(query).limit(8).sort({ created_date: -1 });
      } else {
        output = await Model.find(query).sort({ created_date: -1 });
      }
    } else {
      output = await Model.find({}).sort({ created_date: -1 });
    }

    res.status(201).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
