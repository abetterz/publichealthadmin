const express = require("express");
const auth = require("../../middleware/auth");
const google = require("../../middleware/google");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// upload file
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

let credentials = {
  type: "service_account",
  project_id: "platinum-device-329513",
  private_key_id: "79edc6623414511c5cc3a900b5bc878463412108",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDgWwJgxsNEn6CN\nx0LtBuEvtnChaLF5sTn6bPFjjZls0I8Lw2HAHt/JKFICUcF5F4RDQ3u/LkWXHpcB\nE9vU4025VfQAqXrPbw4DVrOQSAtbaMXSbAz5XntwD8FvGQswHRjahqTEcMT5PhXO\nqknAWwrGgez5zBhsWwvMIoAoUXVM2U2vIJVhjIn+zwH+HE8I1u6g3UgHZoMerot6\nNvP07/uKQL5iwCdnKLjm8HNgXPyjQD6/U1nrd88P7cptY8aeq5iwNDPz4YyIqLYw\nC4F1rKYZPl+1HIP8vIGqxIqSioIfzUVuCSAaFZEHAaBoYrAp7khrOrMR5DHllmt/\n1K4dWGQnAgMBAAECgf8/rur94sLgDRowebSFk25YHMaGX9wArvhwx9EScR8bxBeB\nP0nVPu5G1dXG0sNtm+nvLeNHtoVftU8nqdC8nR4dfZ3FPQD0izwZtoKXHIbHa6C7\nb0WU2JIxPPJV7BtA4lbWW2G/C5jd0WxfPUxcotBsMx+7yDMmjrF1QFXLG/7ae6F9\nda8xQaYHnlXtVU6fHIh2oreRgZwsTpUgvC9uSrcgNodTooaUcllaO9qV4sYoVgvn\n16SyAi86RIKfgIEs2VfHopM96DtmoNPh38eTj3tpL7mYwSkFy0buqNXr8MsdY0jF\nqpm3WKqAQGh2PsWFcWMSxx4imuaO6aKPugJKXOECgYEA9B/+Xe7oCKECBmW3S440\nj1hIpuLPrpQYI00xJdjjY5kGev67nqqva87WMhGXsftMLU/nkHu5zhj0WJ4J1PAw\nLX0iTp4EUJ1cvoF61rXdQFaIN+KwPk6PeoJ8trkdyOLEvkrmgzg9Acx7t3WWLVtO\n0VncYvywfg8IxbDf3pqafzkCgYEA60TVRZdBP8VfqKVN4Gi4I7eLxgCSrb6Msvlo\nhLe54HPUJCGuJ6+nWYt6/wIu4ynp9GZrBvR91wgrsG8DxQVPUX96VVQqPltZQQoJ\no0pa70GH4PP2heDVErC5YRFn2xkqWfMphTjusv7sZUKzBycdcI1Dzgpvd19ub0tV\ncYFunl8CgYEAkAIfh0HbVtvD2go+qi9lCfpGQUwivxVVd92dVHoxCRvIGt4Rx3Ng\nr/P/nuGJ3tAjC8fLDgwue0l1OqFfo2Fcyji6+C121ic+ApNW5zm5Hq7tBCqRVO/6\n64X2E8P3sf0zmh2NBXMzadA6WuregDsQr6aWvz3Yz0QHJLdGGIaTBOECgYEAjX+A\npbIq1CfpOIzzIZzZ4uFpd1Sw4z5PcPUAH5JAgPYpCPIYxFWo2PpCp0yw1n9G7m8K\nv8wcQ0/uttaN9dkTs3hwIxHTtl1KeQuIcGUv++X1yx3vjuWCQRN46yCEzgl8p0zQ\nFAgByDX6B4zuD8c+tYrA1RMBp1IGIXm1kea+mRECgYBKdUYoTSC1BgT9NszSoALQ\npIqByJv9Av6cPzorAn8KzQrkdoLAzfDZ2WUIJXzUC6cqJ4OOPKClBMK+QZmwEWrO\nvxTfGANeUwsGvzpMxjH1TjdaO7KaEqxp1PeM81PKZABEc1KY0+GK/nUBt+8SY3vl\ny6MQAd5tyhN/J2DW7rR0qQ==\n-----END PRIVATE KEY-----\n",
  client_email: "promo-testing@platinum-device-329513.iam.gserviceaccount.com",
  client_id: "102944235136958343478",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/promo-testing%40platinum-device-329513.iam.gserviceaccount.com",
};

router.post("/branding/:file_bucket", [auth], async (req, res) => {
  let { file_bucket = "files" } = req.params;

  const file_type = "file";

  let uploaded_file_path = req.files[file_type].tempFilePath;

  try {
    let config = {
      changed_name:
        file_bucket + "/" + Date.now() + "-" + req.files[file_type].name,
      file_location: path.join(uploaded_file_path),
    };
    let { changed_name, metedata_event, file_location, gzip } = config;

    let uploadCallback = async (err, file, apiResponse) => {
      try {
        // delete the temporary file after word
        fs.unlink(path.join(uploaded_file_path), (err) => {
          if (err) throw err;
        });

        // save to files
        let payload = {
          user: req.user.id,
          place: req.current_place && req.current_place._id,
          link: apiResponse.selfLink,
          metadata: { ...apiResponse },
        };
        let new_file = new File(payload);
        await new_file.save();
        const got_body = getBody("upload_files", new_file);
        res.json(got_body);
      } catch (error) {}
    };

    let options = {
      resumable: true,
      validation: "crc32c",
      metadata: {
        metadata: {},
      },
    };

    const gc = new Storage({
      credentials,
      projectId: "platinum-device-329513",
    });

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

    let merchant_file_upload = gc.bucket("promo-testing-bucket");

    let uploaded = await merchant_file_upload.upload(
      config.file_location,
      options,
      uploadCallback
    );
  } catch (err) {
    let output = {
      key: "upload",
      msg: err.message,
    };
    res.status(500).send(output);
  }
});
module.exports = router;
