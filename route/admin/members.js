const express = require("express");
const auth = require("../../middleware/auth");
const { getBody } = require("../../utils/api");
const getModel = require("../../models/index");
const { getPlaceApi } = require("../../public_api/place");
const path = require("path");
const sanitizer = require("string-sanitizer");
const puppeteer = require("puppeteer");

// Google Auth
const router = express.Router();
const { data } = require("../../test");
const fs = require("fs");

const uploadToGoogle = require("../../utils/upload");

router.post("/subscribe", async (req, res) => {
  try {
    let Model = getModel({ model: "members" });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let newSub = new Model(req.body);
    await newSub.save();
    console.log(newSub);
    res.status(201).json({ msg: "Success" });
  } catch (error) {
    console.log(error, "testing_publishing_error");
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.get("/subscribe", async (req, res) => {
  try {
    let Model = getModel({ model: "members" });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let output = await Model.find();

    console.log(output.length);

    res.status(201).json({ msg: "Success" });
  } catch (error) {
    console.log(error, "testing_publishing_error");
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/subscribe_sagebrush", async (req, res) => {
  try {
    let Model = getModel({ model: "subscribe_sagebrush" });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let newSub = new Model(req.body);
    await newSub.save();
    console.log(newSub);
    res.status(201).json({ msg: "Success" });
  } catch (error) {
    console.log(error, "testing_publishing_error");
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.get("/subscribe_sagebrush", async (req, res) => {
  try {
    let Model = getModel({ model: "subscribe_sagebrush" });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let output = await Model.find();

    console.log(output.length);

    res.status(201).json({ msg: "Success" });
  } catch (error) {
    console.log(error, "testing_publishing_error");
    res.status(error.status || 400).json({ message: error.message });
  }
});
module.exports = router;
