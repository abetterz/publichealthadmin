function confirmationHandler(err, output, res) {
  if (err) {
    res &&
      res.status(400).json({
        errors: [
          {
            msg: "Error while sending validation email" + err.message,
          },
        ],
      });
  }
  let action_payload = {
    ...output,
    date: Date.now(),
    description: "send verification email",
  };
  return action_payload;
}

module.exports = {
  confirmationHandler,
};
