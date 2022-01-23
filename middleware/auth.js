const jwt = require("jsonwebtoken");
require("dotenv").config();
const Profile = require("../models/auth/Profile");
const User = require("../models/auth/User");
const Manager = require("../models/business/manager");
const { getBody } = require("../utils/api");

module.exports = async (req, res, next = (f) => f) => {
  // Get token from header
  let ip_address = req.connection.remoteAddress;
  req.ip_address = ip_address;

  const token = req.header("x-auth-token");

  // Check if not token
  if (!token && !ip_address) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  if (token) {
    // Verify token
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded.user;

      next();
    } catch (err) {
      res.status(500).json({
        status: 400,
        errors: [{ msg: err.message || "Token is not valid" }],
      });
    }
  } else if (ip_address) {
    try {
      let current_profile = await Profile.findOne({
        ip_address,
        user: { $exists: false },
      });

      if (!current_profile) {
        current_profile = await Profile.findOne({
          ip_address,
        });
        if (!current_profile) {
          current_profile = new Profile({
            ip_address,
            name: "Guest",
          });
          await current_profile.save();
        }
      }

      req.current_profile = current_profile;
    } catch (error) {}
    next();
  } else {
    return res
      .status(401)
      .json({ msg: "No token or ip address, authorization denied" });
  }
};
