const Place = require("../models/business/Place");
const Hour = require("../models/business/Hour");
const Access = require("../models/auth/Access");
const Package = require("../models/benefits/Package");
const Commitee = require("../models/benefits/Commitee");
const BusinessEvent = require("../models/benefits/Event");
const Job = require("../models/business/Job");
const Manager = require("../models/business/manager");
const Connection = require("../models/business/Connection");

const getPlaceApi = async (obj) => {
  let output = {};
  try {
    const { _id, public_key, private_key } = obj;
    let place_query = {};
    let place_populate = [
      { path: "logo", select: "link" },
      { path: "poster", select: "link" },
      { path: "banner", select: "link" },
    ];

    let package_populate = [{ path: "image", select: "link" }];
    let commitee_populate = [{ path: "poster", select: "link" }];
    let event_populate = [{ path: "poster", select: "link" }];
    let job_populate = [
      { path: "public_files", select: "link" },
      { path: "private_files", select: "link" },
    ];
    let business_members_populate = [];

    let manager_populate = [];

    let hours_query = {};
    if (_id) {
      place_query = { _id: _id };
      place_populate = ["logo", "banner", "poster"];
    } else if (public_key && private_key) {
      let access = Access.find({
        public_key,
        private_key,
      });
      place_query = { _id: access.place };
      hours_query.public = true;
    }
    let place = await Place.findOne(place_query).populate(place_populate);

    hours_query.place = place._id;
    let hours = await Hour.find({ place: place._id }).sort({
      created_at: -1,
    });
    let packages = await Package.find({ place: place._id }).populate(
      package_populate
    );
    let commitees = await Commitee.find({ place: place._id }).populate(
      commitee_populate
    );
    let events = await BusinessEvent.find({ place: place._id }).populate(
      event_populate
    );

    let jobs = await Job.find({ place: place._id }).populate(job_populate);
    let employees = await Manager.find({ place: place._id }).populate(
      manager_populate
    );

    let business_members = await Connection.find({
      $or: [{ "sender.place": place._id }, { "receiver.place": place._id }],
    }).populate(business_members_populate);

    output = {
      place,
      hours,
      packages,
      commitees,
      events,
      jobs,
      employees,
      business_members,
    };
  } catch (error) {
    console.log(error, "testing errors");
  }
  return output;
};

module.exports = {
  getPlaceApi,
};
