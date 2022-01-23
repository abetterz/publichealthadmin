const Confirmation = ({ code }) => {
  return `Your PROMO code is ${code}`;
};
const RecoveryCode = ({ code }) => {
  return `Your PROMO password recovery code is ${code}`;
};

module.exports = {
  confirmation: Confirmation,
  recovery_code: RecoveryCode,
};
