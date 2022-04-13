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
      resumable: true,
      metadata: {
        metadata: {},
      },
    };

    const gc = new Storage();

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
