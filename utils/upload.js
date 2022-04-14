const { Storage } = require("@google-cloud/storage");
const path = require("path");

require("dotenv").config();

let credentials = {
  type: "service_account",
  project_id: "fabled-zone-339123",
  private_key_id: "f7749d8318a333b972940a263f27f9923bcad1c4",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDOjraAIutjAd5W\nXgUP71IIEQ/9MD8qUk7pjdoNaI27tpTcb4FkYkOIePFEYSNr+/8etk6Z7d7lxZlh\n31kvNqg9JI9Mef6bDinIMiAweQEAVVVa6Y4LnwrhG6XsoKLC8z9i7hny2t7pp/v9\n6wkCk9NNE5aBHl3zxLR/oteXOKHMdo5L1jxfsvDNIbBfG87ySn2DlIuhX82VQTSm\n7127Hr9KNb3p6azHJglU0jWfM0I5/6bezPpJE11mNFg5ApY1EP9bsz94KBAQ3Jyi\neHsg0pdK+dxq2O/wnSmSUVL2zYX8ufIZJlVU4Eb7Gc+bqTQkqQhK+76+sYtBt4oe\nohcBJBkRAgMBAAECggEABBZ89CI8yFPUI59uuDcDR5eW2mrnBR5l42dkRlmoXGur\nnIU0aVksfvntxG2rtspg7Smseo1jmOaFN5Ok/zM0tykPEPNlH4pzNzwOuQbcBzap\nHsh6gC5gl73lVb6EGhmYSovtxYmhWbxyVz8ciYmFaAQYOWvxbg6Zh+EgJSUAxrwU\nxb3/XK+2fknwItYBo5Tk3UZWyclmnqiZr0vPDHMcem8j5tGxn63CasY4Dsw+TzyQ\ngp+GYw4Qw9VcUqgn/Zx/7FPTlNGeZLtzOStyfDAZJSzWGAxBH2T6QqNWw0fD6ofC\nM8LaUnpsYSjAd7XC4bR5diCg+u7YS+8IicuwWF14ZQKBgQD9cVRSpUEOJYTWM0gX\nOsl6UNBT3PLTfGpUY1ZquphkpRKz6SDR0duTqx6/eol3ZTvRqY3ZNC4z7Mslslf+\nIcucuq1JKPWfzfKVXTuB7ofCcA+XQR0PxSQ3x9CmsPtQeMWA4kXSEd2g2rnzQCY6\n3gWllXzjEiVawTZUtyjWpWEf7wKBgQDQpEYWM2xSw/M4XYnN548ivt14SQbaHCa/\nH/jOoiV0l2VKwFJXO63rZH4z0hl8xZd4/sNe8awnt8H8o2ObegIryrg2hwQDPTiY\nBiRehhAk79dEyodW3RfnAtWp+raJilXNfCVhpF5CuuVcwn+AY2Kc0RxYTm68F6Gu\n02UXSwVW/wKBgB5Ln8LJUj94qKpaMvHj6xWd92ku7i/tnWA9B6V2bKULPnMXGP87\n0L2UJPbKlQgap83mMLiYDjXSxm3ZJb+RFp/DiNdH+CSEH81O+cAMXVoWvyZbeDfc\nXvnz/rMOUNxLs4A2jBYSYKXLv5KeRnOe+pnShr01/BUfJ3l084LE/hktAoGABZ52\n+MAXyb7XPQxf2rjCxRfI1SV6VsNtU7ZjuATr51DwfGvji8/ipjVFpNWitBaKNsr9\nrf/qOAOd6NTpqNVHW7CQ9375X7D1Zjq8HgOUSbpf3M1ria5Yp3MPGA3VfqzIFMmk\nJBYOJ9Pqu23Ni0Kh9EE5dzNdjhlA1HmC/naZxTcCgYBXErAIohm9l02xtyVjlS4t\nIRm6OzdIHg8uXpKm0Pd2tps1IKONoXUG6ohkH8SkTKh7cHwtOihWs4FG5wWd85a/\nfohQb6+fWEesQ+YZ/hGHTGgW3NeF5weIHBv2jF/4gyC1NM3ZuaW2WxjDKjcTFEhv\npGG7EiRLk0pEGKtvz9ZyFw==\n-----END PRIVATE KEY-----\n",
  client_email: "publichealth@fabled-zone-339123.iam.gserviceaccount.com",
  client_id: "102225954664203031947",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/publichealth%40fabled-zone-339123.iam.gserviceaccount.com",
};

const uploadToGoogle = async ({
  changed_name,
  uploaded_file_path,
  uploadSuccess = (f) => f,
}) => {
  let file_location = path.join(uploaded_file_path);

  let bucket = "publichealthnews";

  let options = {
    resumable: true,
    validation: "crc32c",
    metadata: {
      metadata: {},
    },
  };

  const gc = new Storage({
    credentials,
    projectId: "fabled-zone-339123",
  });

  if (changed_name) {
    options.destination = changed_name;
  }

  let location = file_location;

  let merchant_file_upload = gc.bucket(bucket);

  merchant_file_upload.upload(file_location, options, uploadSuccess);
};

module.exports = uploadToGoogle;
