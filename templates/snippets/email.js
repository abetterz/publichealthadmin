const OrderDetailProductExtrator = (clicks = []) => {
  let output = "";
  clicks.forEach((click) => {
    const { selected } = click || {};
    let variations = {};
    selected.options &&
      selected.options.forEach((option) => {
        let option_row = `
          
                  <tr>
                    <td
                      style="
                              font-size: 12px;
                          color: #203442;
                          font-family: poppins;
                          margin-bottom: 3px;
                          mso-line-height-rule: exactly;
                          line-height: 18px;
                          padding: 10px 20px 0px 30px;
                          "
                      >
                          (${option.qty}) ${option.sold_product_name}
                    </td>
                  </tr>
              
        `;
        if (variations[option.sold_option_name]) {
          variations[option.sold_option_name] += option_row;
        } else {
          let option_name = `
            <tr>
              <td
                style="
                              font-size: 12px;
                          color: #203442;
                          font-family: poppins;
                          margin-bottom: 3px;
                          mso-line-height-rule: exactly;
                          line-height: 18px;
                          padding: 10px 20px 0px 30px;
                          "
              >
                ${option.sold_option_name}
              </td>
            </tr>
         `;

          variations[option.sold_option_name] = option_name + option_row;
        }
      });
    let values = Object.values(variations);
    let options = values.join();

    let product_row = `<tr
    style="
  margin-bottom: 10px;
  margin-top: 10px;
    "
    >
        <td>
          <tr>
            <td
              style="font-size: 15px;
                        color: #203442;
                        font-family: poppins;
                        margin-bottom: 3px;
                        d mso-line-height-rule: exactly;
                        line-height: 20px;
                        padding: 20px 0px 0px;
                    "
            >
              (${selected && selected.qty}) ${selected && selected.rename}
            </td>
          </tr>
        
          ${options}
        </td>
      </tr>`;

    output += product_row;
  });

  return output;
};

module.exports = {
  OrderDetailProductExtrator,
};
