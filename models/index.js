// analytics
const action = require("./analytics/Action");
const error_log = require("./analytics/ErrorLog");

// auth
const profile = require("./auth/Profile");
const user = require("./auth/User");

// content
const posts = require("./contents/Post");
const scientists = require("./contents/Scientist");
const websites = require("./contents/Website");

const dict = {
  // logs
  action,
  error_log,
  // auth
  profile,
  user,
  // content
  posts,
  scientists,
  websites,
  users: user,
};

const getModel = ({ model }) => {
  const output = dict[model];
  return output;
};

module.exports = getModel;
