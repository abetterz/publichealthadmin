const { getDict } = require("../config/body");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function checkErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

async function sendErrors(res, prop, errors, status) {
  if (prop) {
    await res.status(status || 400).json({ errors });
    return true;
  }
  return false;
}

async function getBody(key, body, callback, config = {}) {
  let gotDict = getDict(key);
  let output = body;
  if (body && gotDict) {
    if (Array.isArray(body)) {
      output = [];
      body.forEach((got_body) => {
        let to_push = {};
        gotDict.forEach((entry) => {
          let new_entry = got_body[entry];
          if (Array.isArray(new_entry)) {
            if (new_entry[0]) {
              to_push[entry] = new_entry;
            }
          } else {
            to_push[entry] = new_entry;
          }
        });
        output.push(to_push);
      });
      return output;
    } else {
      output = {};
      gotDict.forEach((entry) => {
        let new_entry = body[entry];
        if (Array.isArray(new_entry)) {
          if (new_entry[0]) {
            output[entry] = new_entry;
          }
        } else {
          output[entry] = new_entry;
        }
      });
      if (callback) {
        return callback(output);
      }
      return output;
    }
  }

  if (config && config.add) {
    output = {
      ...output,
      ...config.add,
    };
  }
  return output;
}

function getRandomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

const createToken = async (props) => {
  let { expiresIn = 3600000, payload, error_list = [], res } = props;
  await jwt.sign(payload, JWT_SECRET, { expiresIn }, async (err, token) => {
    if (err) throw err;
    let output = {
      status: 201,
      message: {
        token,
        ...payload,
      },
    };
    if (error_list && error_list[0]) {
      output.status = 206;
      output.message.message = { form: error_list };
    }

    await res.status(output.status).json(output.message);
    return output;
  });
  return;
};

const sendError = async (props) => {
  let { error, res } = props;
  await res.status(error.status).json(error.message);
};

module.exports = {
  checkErrors,
  sendErrors,
  getBody,
  getRandomInt,
  createToken,
  sendError,
};
