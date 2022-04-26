const express = require("express");
const auth = require("../../middleware/auth");
const { getBody } = require("../../utils/api");
const getModel = require("../../models/index");
const { getPlaceApi } = require("../../public_api/place");
const path = require("path");
const sanitizer = require("string-sanitizer");
const puppeteer = require("puppeteer");
const { Parser } = require('json2csv');

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

    console.log(req.body, "testing_body");

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

router.get("/allmembers", async (req, res) => {
  try {
    let Model = getModel({ model: "members" });

    if (!Model) {
      throw {
        status: 400,
        message: "Server Error",
      };
    }

    let output = await Model.find({},'-_id fullname email');

    const fields = [{
      label: 'Name',
      value: 'fullname'
    },{
      label: 'Email',
      value: 'email'
    }];
  try {
  const parser = new Parser({fields});
  const csv = parser.parse(output);
  const fs = require('fs');
  fs.writeFileSync('members.csv', csv)
try {
  var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zaxissender@gmail.com',
    pass: 'solutions34'
  }
});

var mailOptions = {
  from: 'zaxissender@gmail.com',
  to: 'marketing@zaxissolutions.com',
  subject: 'Email List',
  text: 'Email list is attached below',
  attachments: [{
    filename: "members.csv",
    path: 'members.csv'
}]
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
  
  // file written successfully
} catch (err) {
  console.error(err);
}
  console.log(csv);
  } catch (err) {
  console.error(err);
  }
  console.log(output.length);
    res.status(201).json({ msg: "Success"});
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});
module.exports = router;
