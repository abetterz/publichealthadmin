const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const { getBody, createToken } = require("../../utils/api");
const User = require("../../models/auth/User");
const Analytics = require("../../models/analytics/Analytics");

const Profile = require("../../models/auth/Profile");
const Action = require("../../models/analytics/Action");
const ErrorLog = require("../../models/analytics/ErrorLog");

// Google Auth
const router = express.Router();

// CONSTANTS
const JWT_SECRET = process.env.JWT_SECRET;

router.get(`/load_user/`, [auth], async (req, res) => {
  try {
  } catch (error) {}

  try {
    let query = req.user && req.user.id;
    const user = await User.findById(query).select("-password");
    let error_list = [];

    if (user && user.verified) {
      let exist = await Analytics.exists({email: user.email});
      console.log(exist);

      if(exist == false){
        var analytics = new Analytics({user:user,email:user.email});
        await analytics.save(); 
        console.log(analytics);
      }else{
        await Analytics.findOneAndUpdate({email :user.email}, {$inc : {'logincount' : 1},lastLogin: Date.now()}).exec((err, result) => {
          if(err){
              return console.log(err);
          }else{
              console.log("Working");
              console.log(result);
          }
      })
      }
    }

    if (user && user.verified) {
      let found_profile = await Profile.findOne({
        user: user.id,
        current: true,
      });

      await user.save();

      // get current place
      const payload = {
        user: {
          id: user.id,
        }
      };
      let output = { ...payload };
      res.json(output);
    } else if (user && !user.verified) {
      let message = "Pending Access";
      error_list.push({ error: message, key: "email" });
      let output = { message: { form: error_list, body: req.body } };

      res.status(206).json({ message: output });
    } else {
      let message = `Unauthorized User`;

      error_list.push({ error: message });

      throw {
        status: 206,
        message: { form: error_list },
      };
    }
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.post("/login/", async (req, res) => {
  const BODY = req.body;
  const dict_key = "login";
  try {
    let error_list = [];
    let got_body = await getBody(dict_key, BODY);

    console.log(got_body);
    let { password, email } = got_body;

    let user = await User.findOne({ email });
    if (!user) {
      let message = `Invalid Credentials`;

      error_list.push({ error: message, key: "username" });

      throw {
        status: 403,
        message: {
          message: { form: error_list, body: req.body },
        },
      };
    } else if (!user.verified) {
      let message = `Pending Access`;

      error_list.push({ error: message, key: "username" });

      throw {
        status: 403,
        message: {
          message: { form: error_list, body: req.body },
        },
      };
    }

    const isMatch = password && (await bcrypt.compare(password, user.password));

    if (!isMatch) {
      let message = `Invalid Credentials`;

      error_list.push({ error: message, key: "password" });

      throw {
        status: 403,
        message: {
          message: { form: error_list, body: req.body },
        },
      };
    }

    let found_profile = await Profile.findOne({
      user: user._id,
    });

    let current_profile = await getBody("current_profile", found_profile);

    const payload = {
      user: {
        id: user.id,
      },
      profile: current_profile,
    };

    await createToken({ payload, error_list, res });
  } catch (error) {
    res.status(error.status || 501).json(error.message);
  }
});

router.post("/register/", async (req, res) => {
  // CONSTANTS

  const dict_key = "register";
  const profile_key = "profile";
  let BODY = req.body;

  try {
    // UI/UX: build all errors before throwing it one by one
    let error_list = [];
    // get authorized  detail only
    let got_user_body = await getBody(dict_key, BODY);
    let { email, password, confirm_password, fullname, category } =
      got_user_body;

    if (confirm_password && password !== confirm_password) {
      let message = "Password must match confirmed password";
      await error_list.push({ error: message, key: "confirm_password" });
    }
    if (!email) {
      let message = "You must provide an email address";
      await error_list.push({ error: message, key: "email" });
    }

    if (!password) {
      let message = "You must enter a password";
      await error_list.push({ error: message, key: "password" });
    }

    var email_check = await User.findOne({ ["email"]: email });
    // check if user exists
    if (email_check) {
      let message = `This email already exists (${email})`;

      error_list.push({ error: message, key: "email" });
    }

    // save user if theirs no errors
    if (!error_list[0]) {
      // check if user exists

      // or create a new user AND profile

      let user = new User(got_user_body);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      let got_profile_body = await getBody(profile_key, BODY);
      got_profile_body.updated_at = Date.now();
      got_profile_body.public = true;
      got_profile_body.published = true;

      // make sure these are appropriately.
      // just incase the user pass the value themselves
      // IMPORTANT_SECURITY
      got_profile_body.admin = false;
      got_profile_body.current = true;
      got_profile_body.self = true;
      got_profile_body.user = user._id;
      let profile = new Profile(got_profile_body);
      await profile.save();

      let current_profile = await getBody("current_profile", profile);

      await user.save();

      // create token

      const payload = {
        user: {
          id: user.id,
        },
        profile: current_profile,
      };

      await createToken({ payload, error_list, res });

      let s = {
        model: "User",
        model_id: user._id,
        crud: "Create",
        description: "Created user",
      };

      let user_action = new Action(user_action_payload);
      await user_action.save();

      let action_profile_payload = {
        model: "Profile",
        model_id: profile._id,
        crud: "Create",
        description: "Created user profile",
      };

      let action_profile = new Action(action_profile_payload);
      await action_profile.save();
    } else {
      let error_payload = {
        description: "Create User Error",
        metadata: {
          error_list: error_list,
        },
      };
      await new ErrorLog(error_payload).save();
      throw { status: 403, message: { form: error_list } };
    }
  } catch (error) {
    let error_payload = {
      description: "Create User Error",
      metadata: {
        message: error.message,
      },
    };
    await new ErrorLog(error_payload).save();

    res.status(error.status || 501).json({ message: error.message });
    return;
  }
});

module.exports = router;
