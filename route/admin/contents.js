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

    await Model.remove({ _id: "61ed73c1f914041f00812e2d" });

    console.log("posted data");
    // let created = await Model.insertMany(data);
    let output = "created";

    const puppeteer = require("puppeteer");
    // let directory = __dirname + "\\screenshots\\screenshot.png";

    let allPosts = await Model.find({
      screenshot_error: { $exists: false },
      screenshot: { $exists: false },
      // categories: { $in: ["exclusive", "updated_daily", ] },
      categories: { $in: ["updated_daily"] },
    }).limit(10);

    let posts = await Model.find({
      screenshot: { $exists: false },
      screenshot_error: { $exists: false },
      // categories: { $in: ["exclusive", "updated_daily"] },
      categories: { $in: ["updated_daily"] },
    });
    console.log(posts.length, "testing length");
    // allPosts = [allPosts[1], allPosts[1]];
    let length = allPosts.length;
    let percentage = 0;
    let allscreenshot = allPosts.map(async (item, index) => {
      let title = sanitizer.sanitize(item.title);
      let directory = `screenshots/${title}.png`;

      percentage = ((index + 1) / length) * 100;
      console.log(percentage, "%");
      let uploadSuccess = async (err, file, apiResponse) => {
        // delete the temporary file after word
        fs.unlink(path.join(directory), (err) => {
          if (err) throw err;
        });
        let found = await Model.findById(item._id);
        if (found) {
          found.screenshot = apiResponse.mediaLink;
          await found.save();
        }
        return;
      };

      (async () => {
        try {
          if (item.link && item.title) {
            const browser = await puppeteer.launch({
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
              defaultViewport: { width: 1920, height: 1480 },
            });

            const page = await browser.newPage();
            await page.goto(item.link);

            await page.screenshot({ path: directory });

            await browser.close();

            await uploadToGoogle({
              changed_name: title,
              filetype: "screenshot",
              uploaded_file_path: `screenshots/${title}.png`,
              uploadSuccess,
            });

            return;
          } else {
            return;
          }
        } catch (err) {
          if (!err.message.includes("timeout of")) {
            let found = await Model.findById(item._id);

            found.screenshot_error = err.message;
            await found.save();
            console.log(found.screenshot_error);
          }
          console.log(err.message);
        }
      })();
    });

    await Promise.all(allscreenshot);

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

router.post("/:model/update", [auth], async (req, res) => {
  try {
    const BODY = req.body;
    const { model } = req.params;

    let got_body = BODY;

    let Model = getModel({ model });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }
    if (!got_body._id) {
      throw {
        status: 400,
        message: "Update require an id",
      };
    }

    console.log(req.body, "testing_update");

    await Model.updateOne({ _id: req.body._id }, { $set: got_body });

    let output = await Model.findOne({ _id: req.body._id });

    res.status(201).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});
router.post("/:model/archieved", [auth], async (req, res) => {
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
    if (!got_body._id) {
      throw {
        status: 400,
        message: "Archieved require and id",
      };
    }
    await Model.updateOne(
      { _id: got_body._id },
      { $set: { published: false } }
    );

    let output = Model.findOne({ _id: got_body._id });
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
      front_page: ["front_page"],
    };

    let got_category = dict[category];

    console.log(category);

    let output = [];
    if (got_category) {
      let query = {
        categories: { $in: got_category },
        screenshot: { $exists: true },
      };

      console.log(type);
      if (!type) {
        if (category == "front_page") {
          delete query.screenshot;
        }
        output = await Model.find(query).limit(8).sort({ created_date: -1 });
      } else {
        output = await Model.find(query).sort({ created_date: -1 });
      }
    } else {
      output = await Model.find({ screenshot: { $exists: true } }).sort({
        created_date: -1,
      });
    }

    res.status(201).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.get("/admin_list/:model/read", async (req, res) => {
  try {
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
      front_page: ["front_page"],
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
      output = await Model.find({}).sort({
        created_date: -1,
      });
    }

    res.status(201).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
