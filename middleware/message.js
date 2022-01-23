const mailgun = require("mailgun-js");
const twilio = require("twilio");

const { smsTemplate } = require("../templates/sms");
const { emailTemplate } = require("../templates/emails");
require("dotenv").config();

async function emailTransporter(
  props,
  callback = (f) => f,
  errorCallback = (f) => f
) {
  const { from, to, subject, text, detail = {}, domain, template } = props;
  let MAILGUN_PRIVATE = process.env.MAILGUN_PRIVATE;
  let MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
  const gotHtml = emailTemplate(template);

  try {
    const email = await mailgun({
      apiKey: MAILGUN_PRIVATE,
      domain: MAILGUN_DOMAIN,
    });
    let data = {
      from: "noreply@thepromoapp.net",
      to,
      subject,
      text,
      html: gotHtml(detail),
    };

    let output = await email.messages().send(data, callback);

    return output;
  } catch (err) {
    return { error: [{ key: "emailTransporter", msg: err.messages }] };
  }
}

async function smsTransporter(props) {
  var { from, to, payload, template } = props;
  var accountSid = process.env.TWILIO_ACCOUNT_SID;
  var authToken = process.env.TWILIO_ACCOUNT_TOKEN;

  var client = new twilio(accountSid, authToken);
  const gotTemplate = smsTemplate(template);
  const body = gotTemplate(payload);

  const output = await client.messages.create({
    body,
    to: to || "+13056138521", // Text this number
    from,
  });

  return output;
}

module.exports = {
  emailTransporter,
  smsTransporter,
};
