const express = require("express");
const auth = require("../../middleware/auth");
const google = require("../../middleware/google");
const { getBody, sendError } = require("../../utils/api");

const {
  smsTransporter,
  emailTransporter,
} = require("../../middleware/message");

// Google Auth
const router = express.Router();

router.post("/searched/:source", [auth, google], async (req, res) => {
  try {
    const BODY = req.body;
    let output = {};
    let places;
    if (BODY && BODY.places) {
      places = await getBody("public_place", BODY.places);
      output = places && places[0];
    }
    res.status(200).json(output);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
