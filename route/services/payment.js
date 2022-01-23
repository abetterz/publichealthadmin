const express = require("express");
const auth = require("../../middleware/auth");

const { checkErrors, getBody } = require("../utils/api");
const Manager = require("../../db/models/business/Manager");
const Profile = require("../../db/models/Profile");
const Transaction = require("../../db/models/Transaction");
const Contact = require("../../db/models/Contact");
const User = require("../../db/models/User");
const Batch = require("../../db/models/product/Batch");
const Associate = require("../../db/models/business/Associate");
const { phoneTransport } = require("../../middleware/message");
const {
  purchaseNotification,
  getLocationNotificationDetails,
} = require("../../notification/purchase");

const {
  Payment,
  createPrice,
  createSubscription,
  createCustomer,
  attachPaymentMethodToCustomer,
  stripeRetrieveCustomer,
  CreatePaymentIntent,
  GetPaymentMethods,
} = require("../../middleware/stripe");
const Place = require("../../db/models/business/Place");
const Cart = require("../../db/models/Cart");
const { randomInt } = require("crypto");
const router = express.Router();

const stripeChargeSetter = async ({
  gateway_name,
  processing_type,
  fee,
  token,
  description,
  payment_method,
  customer,
  amount,
  user_id,
}) => {
  let threshold = Number(fee);
  let stripe_amount = Math.round(threshold.toFixed(2) * 100);
  let got_amount = Math.round(amount.toFixed(2));
  let payload = {
    token,
    stripe_amount,
    description,
    payment_method,
    customer,
    amount: got_amount,
  };

  let payment = new Payment(
    gateway_name || "stripe",
    processing_type || "charge"
  );

  let output = await payment.Processor({
    payload,
    user_id,
  });
  return output;
};

router.post("/stripe/pay", [auth], async (req, res) => {
  const { fee, currency } = req.body;
  const { user } = req;

  try {
    let found_user = user && (await User.findOne({ _id: user.id }));
    if (!found_user) {
      throw "You must logged in in order to pay";
    }

    // if the user doesn't exit, create the user
    if (!found_user.stripe_customer_id) {
      // create customer
      const customer = await createCustomer({ user: found_user });
      found_user.stripe_customer_id = customer.id;
      await found_user.save();
    }
    // create the user intent
    const paymentIntent = await CreatePaymentIntent({
      amount: fee,
      email: found_user.email,
      customer: found_user.stripe_customer_id,
    });

    let current_payment_methods = user.payment_methods || [];

    // remove the new payment method
    current_payment_methods.filter((method) => {
      return method.method !== paymentIntent.payment_method;
    });
    if (user.default_payment_method !== paymentIntent.payment_method) {
      // push the current default method
      current_payment_methods.push({
        method: user.default_payment_method,
        default: false,
      });
      // add the new payment method as defualt payment method
      user.default_payment_method = paymentIntent.payment_method;
    }

    // save the payment method
    user.payment_methods = current_payment_methods;

    await user.save();

    res.json({
      email: found_user.email,
      customer: found_user.stripe_customer_id,
      client_secret: paymentIntent["client_secret"],
    });
  } catch (error) {
    res.status(501).json({ status: "payment processing failed" });
  }
});

router.get("/stripe/get_payment_methods", [auth], async (req, res) => {
  try {
    let output = null;

    // get profile data
    let user = req.user && (await User.findOne({ _id: req.user.id }));

    if (user && user.stripe_customer_id) {
      let payment_methods = await GetPaymentMethods({
        customer: user.stripe_customer_id,
      });
      output = payment_methods ? payment_methods.data : null;
    } else if (user) {
      // get the customer profile

      await createCustomer({ user_id: req.user && req.user.id });
    }
    //

    res.send(output);
  } catch (error) {
    res.status(200).json({ status: "error on getting payment method" });
  }
});

router.post("/stripe/charge", [auth], async (req, res) => {
  try {
    const { amount, products, product_key } = req.body;
    let user = await User.findOne({ _id: req.user.id });
    let found_profile =
      (user && (await Profile.findOne({ user: user.id }))) || {};

    const intent = await CreatePaymentIntent({
      amount,
      currency: process.env.CURRENCY || "usd",
      customer: user.stripe_customer_id,
      email: user.email,
    });

    let payment_intents = user.payment_intents || [];
    user.payment_intents = payment_intents;

    // save the items
    await user.save();

    res.json({
      client_secret: intent["client_secret"],
      email: user.email,
      name: found_profile.name,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

router.post("/stripe/save_payment_method", [auth], async (req, res) => {
  let { payment_method } = req.body;
  try {
    let user = await User.findOne({
      _id: req.user.id,
    });

    if (!user.stripe_customer_id) {
      stripe_customer_id = await createCustomer({ user_id: user._id });
      // await attachPaymentMethodToCustomer({
      //   payment_method: payment_method.id,
      //   stripe_customer_id,
      // });
    }

    let default_payment_method = payment_method;
    let payment_methods = user.payment_methods || [];

    if (default_payment_method) {
      payment_methods.filter(
        (method) => method.id !== default_payment_method.id
      );
      user.payment_method = default_payment_method;
      user.payment_methods = payment_methods;
    }

    await user.save();

    res.send(user.payment_method);
  } catch (error) {}
});

router.get("/stripe/first_class", [auth], async (req, res) => {
  if (req.user) {
    try {
      let found_profile = await User.findOne({ user: req.user.id, self: true });
      res.send(found_profile.mallsett_class);
    } catch (error) {
      res.send(null);
    }
  } else {
    res.send(null);
  }
});
router.post("/stripe/first_class", [auth], async (req, res) => {
  try {
    const { price_id, payment_method } = req.body;
    let user = await User.findOne({ _id: req.user.id });

    if (!user.stripe_customer_id) {
      // create customer
      const customer = await createCustomer({ user_id: user._id });
      user.stripe_customer_id = customer;

      await user.save();
    }

    let subscription = await createSubscription({
      customer_id: user.stripe_customer_id,
      price_id: price_id || process.env.FIRST_CLASS_PRICE,
      trial_period_days: process.env.TRIAL_PERIOD_DAYS || 30,
      payment_method: payment_method || user.default_payment_method,
    });

    // add the subscription to the actual user

    let subscription_payload = {
      data: subscription,
      class_type: "first_class",
      subscription_id: subscription.id,
    };

    user.subscription = subscription_payload;

    await user.save();

    res.json(subscription);
  } catch (error) {
    res.status(200).json({ status: "payment processing failed" });
  }
});

router.post("/stripe/purchase_product", [auth], async (req, res) => {
  let { ip_address, user } = req;
  let { token, fee, description, cart_id, tally } = await req.body;
  try {
    let got_error = checkErrors(req, res);

    if (got_error) {
      return;
    }

    let cart_query = { _id: cart_id };
    let found_profile = user && (await Profile.findOne({ user: user.id }));
    if (found_profile) {
      cart_query.creator = found_profile._id;
    } else {
      cart_query.ip_address = ip_address;
    }
    let found_cart = await Cart.findOne(cart_query);
    if (!found_cart) {
      res.status(200).json({ status: "no cart found" });
    } else {
      let processed_payment = {
        object: "free",
        amount: 0,
        status: "succeeded",
      };
      if (fee > 0) {
        processed_payment = await stripeChargeSetter({
          fee,
          description: description && description[0] && description.join(", "),
          token,
        });
      }

      if (processed_payment && processed_payment.status == "succeeded") {
        // update cart
        found_cart.processed_payment = processed_payment;
        found_cart.tally = tally;

        found_cart.paid = true;
        found_cart.amount = fee;
        let red = randomInt(0, 255);
        let green = randomInt(0, 255);
        let blue = randomInt(0, 255);
        found_cart.cart_number = [red, green, blue].join(",");

        // format the order
        let populate = [
          {
            path: "creator",
          },
          {
            path: "location",
            populate: [
              {
                path: "business_profile",
              },
              {
                path: "creator",
              },
            ],
          },
          {
            path: "destination",
            populate: {
              path: "place",
              populate: {
                path: "business_profile",
                populate: {
                  path: "internal_services",
                },
              },
            },
          },
          {
            path: "delivery_service",
          },
          {
            path: "assigned_driver",
          },
          {
            path: "clicks",
          },
        ];

        let batches = await Batch.find({ cart: found_cart._id }).populate(
          populate
        );

        batches.forEach(async (batch) => {
          const {
            batch_id,
            pickup,
            custom_order,
            paid,
            amount,
            total_distance,
            tips_computation,
            tips_amount,
            clicks,
          } = batch;
          // send app notificaiton to all

          let description = {
            batch_id: batch_id,
            pickup,
            custom_order,
            paid,
            amount,
            total_distance,
            tips_computation,
            tips_amount,
            clicks,
            profile_name: found_profile && found_profile.name,
            merchant_name: batch.location.name,
            place_id: batch.location.place_id,
          };
          let profile_description = {
            ...description,
            title: "Order Receipt",
            connections: [],
          };

          // send profile notifcation
          let payload = [];

          if (batch.destination) {
            let payload_destination;

            payload_destination = {
              description: profile_description,
              email: {
                to: batch.destination.email,
                template: "order_on_the_way",
                subject: "An Order from Mallsec.com",
              },
              sms: {
                to: batch.destination.phone_number,
                template: "order_on_the_way",
                text_message: batch.creator.text_message,
              },
            };
            payload.push(payload_destination);

            if (
              batch.destination.place &&
              batch.destination.place.business_profile &&
              batch.destination.place.business_profile[0]
            ) {
              let business_profile_services =
                batch.destination.place.business_profile.filter(
                  (business_profile) => {
                    let services =
                      business_profile.internal_services &&
                      business_profile.internal_services.filter((service) => {
                        return service.order_notification;
                      });
                    return services && services[0];
                  }
                );

              // todo: send messages to business profile services such as valet
            }
          }

          if (batch.location) {
            let location_details = await getLocationNotificationDetails(
              batch.location
            );

            let connection_detail = {
              category: ["Product Location"],
              path: "place",
              _id: batch.location._id,
              name: batch.location.name,
              support_email: location_details.support_email,
              support_phone_number: location_details.support_phone_number,
            };

            let payload_location = {
              description: profile_description,
              email: {
                to: location_details.email,
                template: location_details.template || "new_order",
                subject: location_details.subject || "New Order - Mallsec.com",
              },
              sms: {
                to: location_details.sms,
                template: location_details.template || "new_order",
                subject:
                  location_details.sms_subject || "New Order - Mallsec.com",
              },
            };
            payload.push(payload_location);

            if (location_details.contact && location_details.contact[0]) {
              location_details.contact.forEach((contact) => {
                let input = { ...payload_location };
                input.email.to = contact.email;
                input.sms.to = contact.sms;
                input.description.contact_name = contact.name;
                input.description.merchant_name = batch.location.name;
                if (contact.template) {
                  input.email.template = contact.template;
                }
                payload.push(input);
              });

              profile_description.connections.push(connection_detail);
            }
            if (!location_details.contact || !location_details.contact[1]) {
              profile_description.connections.push(connection_detail);
            }
          }

          if (batch.delivery_service) {
            let delivery_service = batch.delivery_service;
            let connection_detail = {
              category: ["Delivery Service"],
              path: "delivery_service",
              _id: batch.delivery_service._id,
              name: batch.delivery_service.name,
              support_email: delivery_service.support_email,
              support_phone_number: delivery_service.support_phone_number,
            };

            profile_description.connections.push(connection_detail);

            let delivery_service_payload = {
              description: { ...profile_description },
              email: {
                to: delivery_service.notification_email,
                template: "new_order_delivery_service",
                subject: "New Order - Mallsec.com",
              },
              sms: {
                to: delivery_service.notification_sms,
                template: "new_order_delivery_service",
                subject: "New Order - Mallsec.com",
              },
            };

            payload.push(delivery_service_payload);
          }
          if (batch.creator) {
            let payload_profile;

            payload_profile = {
              description: { ...profile_description },
              email: {
                to: batch.creator.email,
                template: "batch_receipt",
                subject: "Your Order On Mallsec.com",
              },
              sms: {
                to: batch.creator.phone_number,
                template: "batch_receipt",
                text_message: batch.creator.text_message,
              },
            };
            payload.push(payload_profile);
          }

          await purchaseNotification(payload);
          // send text to all
        });

        // send the order

        await found_cart.save();
        res.status(201).json({ status: "payment processing successfully" });
      } else {
        res.status(200).json({ status: "payment processing failed" });
      }
    }
  } catch (error) {
    res.status(200).json({ status: "payment processing failed", msg: error });
  }
});

router.post("/stripe/product_purchase", [auth], async (req, res) => {
  let { ip_address, user } = req;
  let { payment_method, fee, description, cart_id, tally } = await req.body;
  try {
    let got_error = checkErrors(req, res);

    if (got_error) {
      return;
    }

    // save the payment method

    let cart_query = { _id: cart_id };
    let found_user = user && (await User.findOne({ _id: user.id }));
    let found_profile = user && (await Profile.findOne({ user: user.id }));
    if (found_profile) {
      cart_query.creator = found_profile._id;
    } else {
      cart_query.ip_address = ip_address;
    }
    let found_cart = await Cart.findOne(cart_query);

    if (!found_cart) {
      res.status(200).json({ status: "no cart found" });
    } else {
      let processed_payment = {
        object: "free",
        amount: 0,
        status: "succeeded",
      };

      if (fee > 0) {
        let stripe_customer_id = await stripeRetrieveCustomer(
          found_user.stripe_customer_id
        );

        if (!stripe_customer_id) {
          stripe_customer_id = await createCustomer({
            user_id: found_user._id,
          });
        }
        let payment_payload = {
          processing_type: "element",
          amount: fee,
          customer: stripe_customer_id,
          description:
            "mallsec.com - " +
            (description && description[0] && description.join(", ")),
          payment_method,
          user_id: found_user._id,
        };

        processed_payment = await stripeChargeSetter(payment_payload);
      }

      let succeeded =
        processed_payment && processed_payment.status == "succeeded";

      if (succeeded) {
        // update cart
        found_cart.processed_payment = processed_payment;
        found_cart.tally = tally;

        found_cart.paid = true;
        found_cart.amount = fee;
        let red = randomInt(0, 255);
        let green = randomInt(0, 255);
        let blue = randomInt(0, 255);
        found_cart.cart_number = [red, green, blue].join(",");

        // format the order
        let populate = [
          {
            path: "creator",
          },
          {
            path: "location",
            populate: [
              {
                path: "business_profile",
              },
              {
                path: "creator",
              },
            ],
          },
          {
            path: "destination",
            populate: {
              path: "place",
              populate: {
                path: "business_profile",
                populate: {
                  path: "internal_services",
                },
              },
            },
          },
          {
            path: "delivery_service",
          },
          {
            path: "assigned_driver",
          },
          {
            path: "clicks",
          },
        ];

        let batches = await Batch.find({ cart: found_cart._id }).populate(
          populate
        );

        batches.forEach(async (batch) => {
          const {
            batch_id,
            pickup,
            custom_order,
            paid,
            amount,
            total_distance,
            tips_computation,
            tips_amount,
            clicks,
          } = batch;
          // send app notificaiton to all

          let description = {
            batch_id: batch_id,
            pickup,
            custom_order,
            paid,
            amount,
            total_distance,
            tips_computation,
            tips_amount,
            clicks,
            profile_name: found_profile && found_profile.name,
            merchant_name: batch.location.name,
            place_id: batch.location.place_id,
          };
          let profile_description = {
            ...description,
            title: "Order Receipt",
            connections: [],
          };

          // send profile notifcation
          let payload = [];

          if (batch.destination) {
            let payload_destination;

            payload_destination = {
              description: profile_description,
              email: {
                to: batch.destination.email,
                template: "order_on_the_way",
                subject: "An Order from Mallsec.com",
              },
              sms: {
                to: batch.destination.phone_number,
                template: "order_on_the_way",
                text_message: batch.creator.text_message,
              },
            };
            payload.push(payload_destination);

            if (
              batch.destination.place &&
              batch.destination.place.business_profile &&
              batch.destination.place.business_profile[0]
            ) {
              let business_profile_services =
                batch.destination.place.business_profile.filter(
                  (business_profile) => {
                    let services =
                      business_profile.internal_services &&
                      business_profile.internal_services.filter((service) => {
                        return service.order_notification;
                      });
                    return services && services[0];
                  }
                );

              // todo: send messages to business profile services such as valet
            }
          }

          if (batch.location) {
            let location_details = await getLocationNotificationDetails(
              batch.location
            );

            let connection_detail = {
              category: ["Product Location"],
              path: "place",
              _id: batch.location._id,
              name: batch.location.name,
              support_email: location_details.support_email,
              support_phone_number: location_details.support_phone_number,
            };

            let payload_location = {
              description: profile_description,
              email: {
                to: location_details.email,
                template: location_details.template || "new_order",
                subject: location_details.subject || "New Order - Mallsec.com",
              },
              sms: {
                to: location_details.sms,
                template: location_details.template || "new_order",
                subject:
                  location_details.sms_subject || "New Order - Mallsec.com",
              },
            };
            payload.push(payload_location);

            if (location_details.contact && location_details.contact[0]) {
              location_details.contact.forEach((contact) => {
                let input = { ...payload_location };
                input.email.to = contact.email;
                input.sms.to = contact.sms;
                input.description.contact_name = contact.name;
                input.description.merchant_name = batch.location.name;
                if (contact.template) {
                  input.email.template = contact.template;
                }
                payload.push(input);
              });

              profile_description.connections.push(connection_detail);
            }
            if (!location_details.contact || !location_details.contact[1]) {
              profile_description.connections.push(connection_detail);
            }
          }

          if (batch.delivery_service) {
            let delivery_service = batch.delivery_service;
            let connection_detail = {
              category: ["Delivery Service"],
              path: "delivery_service",
              _id: batch.delivery_service._id,
              name: batch.delivery_service.name,
              support_email: delivery_service.support_email,
              support_phone_number: delivery_service.support_phone_number,
            };

            profile_description.connections.push(connection_detail);

            let delivery_service_payload = {
              description: { ...profile_description },
              email: {
                to: delivery_service.notification_email,
                template: "new_order_delivery_service",
                subject: "New Order - Mallsec.com",
              },
              sms: {
                to: delivery_service.notification_sms,
                template: "new_order_delivery_service",
                subject: "New Order - Mallsec.com",
              },
            };

            payload.push(delivery_service_payload);
          }
          if (batch.creator) {
            let payload_profile;

            payload_profile = {
              description: { ...profile_description },
              email: {
                to: batch.creator.email,
                template: "batch_receipt",
                subject: "Your Order On Mallsec.com",
              },
              sms: {
                to: batch.creator.phone_number,
                template: "batch_receipt",
                text_message: batch.creator.text_message,
              },
            };
            payload.push(payload_profile);
          }

          await purchaseNotification(payload);
          // send text to all
        });

        // send the order

        await found_cart.save();
        res.status(201).json({ status: "payment processing successfully" });
      } else {
        res.status(200).json({ status: "payment processing failed" });
      }
    }
  } catch (error) {
    res.status(200).json({ status: "payment processing failed", msg: error });
  }
});

router.post("/stripe/business_registration", [auth], async (req, res) => {
  let ip_address = req.connection.remoteAddress;

  let { fee, account_type, token, my_business } = await req.body;
  let body = req.body;

  try {
    let got_error = checkErrors(req, res);
    if (got_error) {
      return;
    }

    let processed_payment = await stripeChargeSetter({
      fee,
      description: account_type,
      token,
    });

    let found_place = await Place.findOne({
      place_id: my_business,
    });

    if (processed_payment && processed_payment.status == "succeeded") {
      // get current profile

      let found_profile = await Profile.findOne({
        user: req.user.id,
        current: true,
      });

      // add thresold to place
      found_place.threshold = fee;
      found_place.account_type = account_type;
      // add owner to place
      found_place.owner = req.user.id;
      // add current place to profile
      found_profile.current_place = found_place._id;

      // create transaction

      let payment_payload = {
        ip_address,
        profile: found_profile._id,
        res: processed_payment,
        type: "business_registration",
        place: found_place._id,
        amount: fee,
      };
      let transaction = new Transaction(payment_payload);
      transaction.save();
      // create manager

      let manager_payload = {
        profile: found_profile._id,
        place: found_place._id,
        place_id: found_place.place_id,
        owned: true,
        place_confirmed: true,
        profile_confirmed: true,
        access_type: ["business_owner"],
        transactions: [transaction._id],
      };

      let manager = new Manager(manager_payload);
      manager.save();

      found_place.managers.push(manager._id);
      found_profile.employers.push(manager._id);

      // connect business with associates.

      let reference_values = Object.values(body.references);
      let set_reference = await reference_values.map(async (reference) => {
        let found_reference = await Place.findOne({
          place_id: reference.place_id,
        });

        let get_contact_body = getBody("contact", reference.contact);
        let contact = new Contact(get_contact_body);
        contact.reason = ["business_reference"];
        await contact.save();

        // uses place id instead of id so when
        let associate_payload = {
          sender: found_place._id,
          receiver: found_reference._id,
          sender_accepted: true,
          access_type: get_contact_body.contact_type,
          contact: [contact._id],
          reason: ["business_reference"],
        };

        let associate = new Associate(associate_payload);
        await associate.save();
        return [associate, contact];
      });

      await Promise.all(set_reference);

      // save
      found_profile.claimed = true;
      found_place.save();
      found_profile.save();
      // save place
      res.status(201).json({ status: "done" });

      // send congratulations to user.
    } else {
      res.status(200).json({ status: "unprocessed" });
    }
  } catch (error) {
    res.status(400).json({ msg: "account processing error" });
  }
});

router.post("/stripe/cart_payment", [auth], async (req, res) => {
  let { ip_address, user } = req;
  let { token, fee, description, cart_id, tally } = await req.body;
  try {
    let got_error = checkErrors(req, res);

    if (got_error) {
      return;
    }

    let cart_query = { _id: cart_id };
    let found_profile = user && (await Profile.findOne({ user: user.id }));
    if (found_profile) {
      cart_query.creator = found_profile._id;
    } else {
      cart_query.ip_address = ip_address;
    }
    let found_cart = await Cart.findOne(cart_query);
    if (!found_cart) {
      res.status(200).json({ status: "no cart found" });
    } else {
      let processed_payment = {
        object: "free",
        amount: 0,
        status: "succeeded",
      };
      if (fee > 0) {
        processed_payment = await stripeChargeSetter({
          fee,
          description: description && description[0] && description.join(", "),
          token,
        });
      }

      if (processed_payment && processed_payment.status == "succeeded") {
        // update cart
        found_cart.processed_payment = processed_payment;
        found_cart.tally = tally;

        found_cart.paid = true;
        found_cart.amount = fee;
        let red = randomInt(0, 255);
        let green = randomInt(0, 255);
        let blue = randomInt(0, 255);
        found_cart.cart_number = [red, green, blue].join(",");

        // format the order
        let populate = [
          {
            path: "creator",
          },
          {
            path: "location",
            populate: [
              {
                path: "business_profile",
              },
              {
                path: "creator",
              },
            ],
          },
          {
            path: "destination",
            populate: {
              path: "place",
              populate: {
                path: "business_profile",
                populate: {
                  path: "internal_services",
                },
              },
            },
          },
          {
            path: "delivery_service",
          },
          {
            path: "assigned_driver",
          },
          {
            path: "clicks",
          },
        ];

        let batches = await Batch.find({ cart: found_cart._id }).populate(
          populate
        );

        batches.forEach(async (batch) => {
          const {
            batch_id,
            pickup,
            custom_order,
            paid,
            amount,
            total_distance,
            tips_computation,
            tips_amount,
            clicks,
          } = batch;
          // send app notificaiton to all

          let description = {
            batch_id: batch_id,
            pickup,
            custom_order,
            paid,
            amount,
            total_distance,
            tips_computation,
            tips_amount,
            clicks,
            profile_name: found_profile && found_profile.name,
            merchant_name: batch.location.name,
            place_id: batch.location.place_id,
          };
          let profile_description = {
            ...description,
            title: "Order Receipt",
            connections: [],
          };

          // send profile notifcation
          let payload = [];

          if (batch.destination) {
            let payload_destination;

            payload_destination = {
              description: profile_description,
              email: {
                to: batch.destination.email,
                template: "order_on_the_way",
                subject: "An Order from Mallsec.com",
              },
              sms: {
                to: batch.destination.phone_number,
                template: "order_on_the_way",
                text_message: batch.creator.text_message,
              },
            };
            payload.push(payload_destination);

            if (
              batch.destination.place &&
              batch.destination.place.business_profile &&
              batch.destination.place.business_profile[0]
            ) {
              let business_profile_services =
                batch.destination.place.business_profile.filter(
                  (business_profile) => {
                    let services =
                      business_profile.internal_services &&
                      business_profile.internal_services.filter((service) => {
                        return service.order_notification;
                      });
                    return services && services[0];
                  }
                );

              // todo: send messages to business profile services such as valet
            }
          }

          if (batch.location) {
            let location_details = await getLocationNotificationDetails(
              batch.location
            );

            let connection_detail = {
              category: ["Product Location"],
              path: "place",
              _id: batch.location._id,
              name: batch.location.name,
              support_email: location_details.support_email,
              support_phone_number: location_details.support_phone_number,
            };

            let payload_location = {
              description: profile_description,
              email: {
                to: location_details.email,
                template: location_details.template || "new_order",
                subject: location_details.subject || "New Order - Mallsec.com",
              },
              sms: {
                to: location_details.sms,
                template: location_details.template || "new_order",
                subject:
                  location_details.sms_subject || "New Order - Mallsec.com",
              },
            };
            payload.push(payload_location);

            if (location_details.contact && location_details.contact[0]) {
              location_details.contact.forEach((contact) => {
                let input = { ...payload_location };
                input.email.to = contact.email;
                input.sms.to = contact.sms;
                input.description.contact_name = contact.name;
                input.description.merchant_name = batch.location.name;
                if (contact.template) {
                  input.email.template = contact.template;
                }
                payload.push(input);
              });

              profile_description.connections.push(connection_detail);
            }
            if (!location_details.contact || !location_details.contact[1]) {
              profile_description.connections.push(connection_detail);
            }
          }

          if (batch.delivery_service) {
            let delivery_service = batch.delivery_service;
            let connection_detail = {
              category: ["Delivery Service"],
              path: "delivery_service",
              _id: batch.delivery_service._id,
              name: batch.delivery_service.name,
              support_email: delivery_service.support_email,
              support_phone_number: delivery_service.support_phone_number,
            };

            profile_description.connections.push(connection_detail);

            let delivery_service_payload = {
              description: { ...profile_description },
              email: {
                to: delivery_service.notification_email,
                template: "new_order_delivery_service",
                subject: "New Order - Mallsec.com",
              },
              sms: {
                to: delivery_service.notification_sms,
                template: "new_order_delivery_service",
                subject: "New Order - Mallsec.com",
              },
            };

            payload.push(delivery_service_payload);
          }
          if (batch.creator) {
            let payload_profile;

            payload_profile = {
              description: { ...profile_description },
              email: {
                to: batch.creator.email,
                template: "batch_receipt",
                subject: "Your Order On Mallsec.com",
              },
              sms: {
                to: batch.creator.phone_number,
                template: "batch_receipt",
                text_message: batch.creator.text_message,
              },
            };
            payload.push(payload_profile);
          }

          await purchaseNotification(payload);
          // send text to all
        });

        // send the order

        await found_cart.save();
        res.status(201).json({ status: "payment processing successfully" });
      } else {
        res.status(200).json({ status: "payment processing failed" });
      }
    }
  } catch (error) {
    res.status(200).json({ status: "payment processing failed", msg: error });
  }
});

module.exports = router;
