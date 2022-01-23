const path = require("path");
const fs = require("fs");
const express = require("express");
const router = express.Router();
const { FileUpload } = require("../../middleware/upload");

router.post("/:type", async (req, res) => {
  let file_type = req.params.type;
  let uploaded_file_path = req.files[file_type].tempFilePath;
  try {
    let config = {
      changed_name: Date.now() + "-" + req.files[file_type].name,
      file_location: path.join(uploaded_file_path),
    };

    let ImageMiddleware = (err, file, apiResponse) => {
      // delete the temporary file after word
      fs.unlink(path.join(uploaded_file_path), (err) => {
        if (err) throw err;
      });


      res.json({
        ...apiResponse,
      });
    };

    let ImageError = (err) => {
      let output = { key: "FileUpload", msg: err.message };
      res.status(500).send(output);
    };

    let fil_upload = await FileUpload(config, ImageMiddleware, ImageError);

  } catch (err) {
    let output = {
      key: "upload",
      msg: err.message,
    };
    res.status(500).send(output);
  }
});
module.exports = router;
