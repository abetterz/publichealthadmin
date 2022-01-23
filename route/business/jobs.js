const express = require("express");
const auth = require("../../middleware/auth");
const { getBody } = require("../../utils/api");
const getModel = require("../../models/index");
const { getPlaceApi } = require("../../public_api/place");

const User = getModel({ model: "user" });
const Manager = getModel({ model: "manager" });

// Google Auth
const router = express.Router();

const createUser = async (payload) => {
  try {
    const { body, user, place } = payload;
    let found_user = await User.findOne({
      $or: [{ email: body.email }, { phone: body.phone }],
    });

    if (!found_user) {
      let user_body = (await getBody("user", body)) || {};
      found_user = new User(user_body);
      await found_user.save();
    }

    return found_user;
  } catch (error) {
    return null;
  }
};

const createEmployee = async (payload) => {
  const { body, user, place } = payload;
  let output = {};

  try {
    let found_user = await createUser(payload);

    //   check to see if theirs an existing manager
    let found_manager = await Manager.findOne({ user: found_user._id, place });
    if (!found_manager) {
      let manager_body = (await getBody("manager", body)) || {};
      manager_body = {
        ...manager_body,
        user: found_user._id,
        current: true,
        host: user,
        place,
        place_confirmed: true,
      };
      let created_manager = new Manager(manager_body);
      await created_manager.save();
    }
    let public_manager = (await getBody("public_manager", found_manager)) || {};

    output.found_manager = public_manager;
  } catch (error) {
    console.log(body, "  error from  land");
  }

  return output;
};
router.post("/jobs/employee", [auth], async (req, res) => {
  const { current_place, body } = req;

  try {
    await createEmployee({
      body,
      user: req.user.id,
      place: current_place._id,
    });

    let output = await getPlaceApi({ _id: current_place._id });
    console.log(output, "createEmployee from  land");

    throw { testing: "testing" };
    res.status(206).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
