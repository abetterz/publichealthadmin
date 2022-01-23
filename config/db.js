const mongoose = require("mongoose");
require("dotenv").config();
const redis = require("redis");

let MONGO_URI = process.env.MONGO_URI;
let REDIS_HOST = process.env.REDIS_HOST;
let REDIS_PORT = process.env.REDIS_PORT;
let REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  } catch (err) {
    // exit process with failure
    process.exit(1);
  }
};

const getSetRedis = async ({ type, data, key, error, success }) => {
  try {
    let client = redis.createClient({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
    });

    if (type === "get") {
      client.get(key, (err, reply) => {
        if (err) {
          return err(err);
        }
        return success(reply);
      });
    } else {
      let output = await client.set(key, JSON.stringify(data));
      return { msg: "success", output, success };
    }
  } catch (error) {
    return { msg: "error", msg: err };
  }
};

module.exports = { connectDB, getSetRedis };
