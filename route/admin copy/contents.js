const express = require("express");
const auth = require("../../middleware/auth");
const { getBody } = require("../../utils/api");
const getModel = require("../../models/index");
const { getPlaceApi } = require("../../public_api/place");
const path = require("path");
const sanitizer = require("string-sanitizer");

// Google Auth
const router = express.Router();
const { data } = require("../../test");
const fs = require("fs");

const uploadToGoogle = require("../../utils/upload");

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
    // let created = await Model.insertMany(data);
    let output = "created";

    const puppeteer = require("puppeteer");
    // let directory = __dirname + "\\screenshots\\screenshot.png";
    let directory = "screenshots/screenshot.png";

    let uploadSuccess = (err, file, apiResponse) => {
      // delete the temporary file after word
      fs.unlink(path.join(directory), (err) => {
        if (err) throw err;
      });
      console.log(err, file, apiResponse, "testin merchant file upload");
    };

    (async () => {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1920, height: 1480 },
      });

      let item = data[7];
      let title = sanitizer.sanitize(item.title);

      const page = await browser.newPage();
      await page.goto();

      await page.screenshot({ path: "screenshots/screenshot.png" });

      await browser.close();
      let uploaded = await uploadToGoogle({
        changed_name: title,
        filetype: "screenshot",
        uploaded_file_path: "screenshots/screenshot.png",
        uploadSuccess,
      });
    })();

    res.status(201).json(output);
  } catch (error) {
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
