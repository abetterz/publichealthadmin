const phone = (num) => {
  let output = "";
  let values = num;
  const allowed_values = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "+",
  ];
  values = values.split("");

  values.forEach((value) => {
    if (allowed_values.includes(value)) {
      output += value;
    }
  });

  return output;
};

module.exports = {
  phone,
};
