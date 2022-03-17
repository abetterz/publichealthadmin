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

router.post("/posts/data", [auth], async (req, res) => {
  try {
    let Model = getModel({ model: "posts" });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    // let created = await Model.insertMany(data);
    let output = "created";

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
    // allPosts = [allPosts[1], allPosts[1]];
    let length = allPosts.length;
    let percentage = 0;
    let allscreenshot = allPosts.map(async (item, index) => {
      let title = sanitizer.sanitize(item.title);
      let directory = `screenshots/${title}.png`;

      percentage = ((index + 1) / length) * 100;
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
          }
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

    let Model = getModel({ model });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let screenshot_title = sanitizer.sanitize(got_body.title);
    let directory = `screenshots/${screenshot_title}.png`;

    // if have direct link, save it on src
    if (got_body.get_image == "external_link") {
      got_body.image = got_body.external_link;
    } else if (got_body.get_image == "upload_image") {
      got_body.image = got_body.image;
    }
    // if have downloadble link, download the image and save to googble place, then get the link and save it to the dabase

    // if none, download the screenshot and save it to google place
    let payload = {
      ...got_body,
      creator: req.user.id,
    };
    let created = new Model(payload);

    await created.save();

    console.log(got_body.get_image, created.image, got_body);
    if (
      got_body.get_image == "screenshot" ||
      (got_body.get_image != "none" && !created.image)
    ) {
      let uploadSuccess = async (err, file, apiResponse) => {
        let found = await Model.findById(created._id).limit(48);
        if (found) {
          found.image = apiResponse.mediaLink;
          await found.save();
        }
        // delete the temporary file after word
        fs.unlink(path.join(directory), (err) => {
          if (err) throw err;
        });
        let output = await Model.findOne({ _id: created._id }).limit(48);
        res.status(201).json(output);
      };
      const TakeScreenshot = async (input) => {
        let { link, width, height, directory, title, uploadSuccess } = input;
        try {
          const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            defaultViewport: { width: width || 1920, height: height || 1480 },
          });
          const page = await browser.newPage();
          if (!link.includes("http") || !link.includes("https")) {
            link = "http://" + link;
          }
          await page.goto(link);
          await page.screenshot({ path: directory });
          await browser.close();
          let res = await uploadToGoogle({
            changed_name: title,
            filetype: "screenshot",
            uploaded_file_path: directory,
            uploadSuccess,
          });
        } catch (err) {
          let output = await Model.findOne({ _id: created._id }).limit(48);
          res.status(201).json(output);
        }
      };
      let take_out_screen = await TakeScreenshot({
        link: got_body.link,
        title: screenshot_title,
        directory,
        uploadSuccess,
      });
      got_body.image = got_body.upload_image;
    } else {
      let output = await Model.findOne({ _id: created._id }).limit(48);

      res.status(201).json(output);
    }
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/:model/update", [auth], async (req, res) => {
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
    if (!BODY._id) {
      throw {
        status: 400,
        message: "Update require an id",
      };
    }

    let original = await Model.findOne({ _id: BODY._id });
    let _doc = (original && original._doc) || {};
    let got_body = {
      ..._doc,
      ...BODY,
    };

    console.log(_doc, "getting-old");
    let created = got_body;

    console.log(got_body.get_image, "get_image");

    // if have direct link, save it on src
    if (got_body.get_image == "external_link") {
      console.log(got_body.get_image, "external_link");
      got_body.image = got_body.external_link;
      await Model.updateOne({ _id: req.body._id }, { $set: got_body });
      let output = await Model.findOne({ _id: created._id }).limit(48);
      res.status(201).json(output);
    } else if (got_body.get_image == "upload_image") {
      console.log(got_body.get_image, "upload_image");

      await Model.updateOne({ _id: req.body._id }, { $set: got_body });
      let output = await Model.findOne({ _id: created._id });
      output.image = req.body.image;
      await output.save();
      res.status(201).json(output);
    } else if (
      got_body.get_image == "screenshot" ||
      got_body.get_image != "none"
    ) {
      console.log("should be getting screenshots");
      let screenshot_title = sanitizer.sanitize(got_body.title);
      let directory = `screenshots/${screenshot_title}.png`;
      let uploadSuccess = async (err, file, apiResponse) => {
        let found = await Model.findById(created._id);

        if (found) {
          found.image = apiResponse.mediaLink;
          await found.save();
        }
        console.log(found, "should be getting screenshots");
        // delete the temporary file after word
        fs.unlink(path.join(directory), (err) => {
          if (err) throw err;
        });
        delete got_body.image;
        await Model.updateOne({ _id: found._id }, { $set: got_body });
        let output = await Model.findOne({ _id: created._id });

        res.status(201).json(output);
      };

      const TakeScreenshot = async (input) => {
        let { link, width, height, directory, title, uploadSuccess } = input;

        try {
          const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            defaultViewport: { width: width || 1920, height: height || 1480 },
          });

          const page = await browser.newPage();
          if (!link.includes("http") || !link.includes("https")) {
            link = "http://" + link;
          }
          await page.goto(link);

          await page.screenshot({ path: directory });

          await browser.close();

          let res = await uploadToGoogle({
            changed_name: title,
            filetype: "screenshot",
            uploaded_file_path: directory,
            uploadSuccess,
          });
        } catch (err) {}
      };

      let take_out_screen = await TakeScreenshot({
        link: got_body.link,
        title: screenshot_title,
        directory,
        uploadSuccess,
      });
      got_body.image = got_body.upload_image;
    } else {
      console.log(got_body.get_image, "else");

      await Model.updateOne({ _id: req.body._id }, { $set: got_body });
      let output = await Model.findOne({ _id: created._id });
      console.log(output, "testing_output");

      res.status(201).json(output);
    }
  } catch (error) {
    console.log(error, "update errors");
    res.status(error.status || 400).json({ message: error.message });
  }
});
router.post("/:model/archieved", [auth], async (req, res) => {
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
        message: "Archieved require and id",
      };
    }
    await Model.updateOne(
      { _id: got_body._id },
      { $set: { published: false } }
    );

    let output = await Model.findOne({ _id: got_body._id });
    res.status(201).json(output);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});
router.post("/:model/drop", [auth], async (req, res) => {
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
        message: "Delete require and id",
      };
    }
    let output = await Model.findOne({ _id: got_body._id });

    if (output) {
      await Model.deleteOne({ _id: output._id });
    }

    res.status(201).json(output);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});
router.get("/:model/read", async (req, res) => {
  try {
    const BODY = req.body;
    const { model } = req.params;
    let { category, type, searched_title, limit = 5 } = req.query;
    let searched = { title: { $regex: searched_title, $options: "i" } };

    let Model = getModel({ model });
    console.log(category, "getting_body");

    if (!limit) {
      limit = 8000;
    }

    limit = Number(limit);

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let dict = {
      featured_story: ["featured_story"],
      top_stories: ["top_stories"],
      exclusive: ["exclusive"],
      must_read: ["must_read"],
      updated_daily: ["updated_daily"],
      breaking_news: ["breaking_news"],
      news: ["news"],
      default: [
        "news",
        "featured_story",
        "top_stories",
        "exclusive",
        "must_read",
        "updated_daily",
        "breaking_news",
      ],
    };

    let got_category = dict[category];

    let output = [];
    if (got_category) {
      let query = {
        published: true,
        categories: { $in: got_category },
        // screenshot: { $exists: true },
      };

      if (searched_title && searched_title.length > 0) {
        query = {
          $and: [query, searched],
        };
      }

      if (!type) {
        if (category == "front_page") {
          delete query.screenshot;
        }
        output = await Model.find(query).limit(limit).sort({ created_at: -1 });
      } else {
        output = await Model.find(query).limit(limit).sort({ created_at: -1 });
      }
    } else {
      let query = {
        published: true,
        // screenshot: { $exists: true },
      };
      if (searched_title && searched_title.length > 0) {
        query = {
          $and: [query, searched],
        };
      }
      output = await Model.find(query).limit(limit).sort({
        created_at: -1,
      });
    }

    let length = output.length;
    console.log(length, got_category);
    res.status(201).json(output);
  } catch (error) {
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
      exclusive_stories: ["exclusive", "top_stories"],
      must_read: ["must_read"],
      updated_daily: ["updated_daily"],
      featured_story: ["featured_story"],
      front_page: ["front_page"],
    };

    let got_category = dict[category];

    let output = [];
    if (got_category) {
      let query = {
        categories: { $in: got_category },
      };

      if (!type) {
        output = await Model.find(query)
          .limit(8)
          .sort({ created_at: -1 })
          .limit(48);
      } else {
        output = await Model.find(query).sort({ created_at: -1 }).limit(48);
      }
    } else {
      output = await Model.find({})
        .sort({
          created_at: -1,
        })
        .limit(48);
    }

    res.status(201).json(output);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.get("/one/:model/read", async (req, res) => {
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
      exclusive_stories: ["exclusive", "top_stories"],
      must_read: ["must_read"],
      updated_daily: ["updated_daily"],
      featured_story: ["featured_story"],
      front_page: ["front_page"],
    };

    let got_category = dict[category];

    let output = [];
    if (got_category) {
      let query = {
        categories: { $in: got_category },
      };

      if (!type) {
        output = await Model.find(query).sort({ created_at: -1 }).limit(1);
      } else {
        output = await Model.find(query).sort({ created_at: -1 }).limit(1);
      }
    }

    res.status(201).json(output);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
