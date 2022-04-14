const path = require("path");
const fs = require("fs");
const express = require("express");
const router = express.Router();

// upload file
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

// let credentials = {
//   type: process.env.GCS_TYPE,
//   project_id: process.env.GCS_PROJECT_ID,
//   private_key_id: process.env.GCS_PRIVATE_KEY_ID,
//   private_key: process.env.GCS_PRIVATE_KEY,
//   client_email: process.env.GCS_CLIENT_EMAIL,
//   client_id: process.env.GCS_CLIENT_ID,
//   auth_uri: process.env.GCS_AUTH_URI,
//   token_uri: process.env.GCS_TOKEN_URI,
//   auth_provider_x509_cert_url: process.env.GCS_AUTH_PROVIDER_CERT_URL,
//   client_x509_cert_url: process.env.GCS_CLIENT_CERT_URL,
// };

let credentials = {
  "type": "service_account",
  "project_id": process.env.GCS_PROJECT_ID,
  "private_key_id": process.env.GCS_PRIVATE_KEY_ID,
  "private_key": process.env.GCS_PRIVATE_KEY,
  "client_email": "publichealth@affable-hall-346918.iam.gserviceaccount.com",
  "client_id": process.env.GCS_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/publichealth%40affable-hall-346918.iam.gserviceaccount.com"
}

router.post("/:type", async (req, res) => {
  let file_type = req.params.type;
  console.log(file_type);
  let uploaded_file_path = req.files[file_type].tempFilePath;
  console.log(uploaded_file_path);
  let location = req.files[file_type].tempFilePath;

  try {
    let config = {
      changed_name: Date.now() + "-" + req.files[file_type].name,
      file_location: path.join(uploaded_file_path),
    };
    let { changed_name, metedata_event, file_location, gzip } = config;

    let uploadSuccess = (err,file,apiResponse) => {
      // delete the temporary file after word
      console.log(err);
      fs.unlink(path.join(uploaded_file_path), (err) => {
        if (err) throw err;
      });
      console.log(apiResponse);
      res.json({
        ...apiResponse,
      });
    };

    let uploadError = (err) => {
      let output = { key: "FileUpload", msg: err.message };
      res.status(500).send(output);
    };
    let bucket = "publichealthnews2";

    let options = {
      resumable: false,
      metadata: {
        metadata: {},
      },
    };

    const gc = new Storage({credentials});

    if (changed_name) {
      options.destination = changed_name;
    }
    if (metedata_event) {
      options.metadata.event = metedata_event;
    }
    if (gzip) {
      options.metadata.gzip = gzip;
    }

    let location = file_location;

    console.log(config.file_location);
    let merchant_file_upload = gc.bucket(bucket);

    merchant_file_upload.upload(config.file_location, options, uploadSuccess);
  } catch (err) {
    console.log(error, "file upload error");
    let output = {
      key: "upload",
      msg: err.message,
    };
    res.status(500).send(output);
  }
});
module.exports = router;
