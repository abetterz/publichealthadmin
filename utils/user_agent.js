const getUserAgent = (order) => {
  let output = {
    age: 24,
    discounts: [
      {
        code: 123,
        merchant: 123,
      },
      {
        code: 456,
        merchant: 789,
      },
    ],
    quantity: 8,
    date_range: {
      date_start: Date.now(),
    },
  };
  return output;
};

module.exports = {
  getUserAgent,
};
