const express = require("express");
const path = require("path");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const { connectDB } = require("./config/db");
const Route = require("./route");
const SocketServer = require("./socket");
const http = require("http");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const HTTP_ADMIN = process.env.HTTP_ADMIN;
const HTTP_WEB = process.env.HTTP_WEB;
const HTTPS_ADMIN = process.env.HTTPS_ADMIN;
const HTTPS_WEB = process.env.HTTPS_WEB;
const PORT = process.env.PORT;

require("events").defaultMaxListeners = 100;

async function run(pid) {
  const app = express();
  // parse cookie. require for socket.io
  app.use(cookieParser());
  app.use(express.json());

  connectDB();

  app.use(express.json({ extended: false }));

  var allowlist = [
    "https://public-health-news.herokuapp.com",
    "https://public-health-news.herokuapp.com",
    "https://publichealth-8le2b.ondigitalocean.app",
    "https://www.publichealth.news",
    "http://www.publichealth.news",
    "https://publichealth.news",
    "http://publichealth.news",
    "http://localhost:3000",
    "https://sagebrushrebellion.com",
    "http://sagebrushrebellion.com",
    "https://www.sagebrushrebellion.com",
    "http://www.sagebrushrebellion.com",

    HTTP_WEB,
    HTTPS_WEB,
    HTTP_ADMIN,
    HTTPS_ADMIN,
  ];

  var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header("Origin")) !== -1) {
      corsOptions = {
        origin: true,
        optionSuccessStatus: 200,
        credentials: true,
      }; // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
  };

  app.use(cors(corsOptionsDelegate));

  // app.use(cors());
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: path.join(__dirname, "/tmp"),
    })
  ); // Don't forget this line!
  const httpServer = http.createServer(app);
  SocketServer(httpServer);

  // user api
  Route.Generate(app);

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}`, pid);
  return { app };
}

exports.run = run;
