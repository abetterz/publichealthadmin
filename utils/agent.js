function removeSpace(str) {
  let output = str.replace(/ /g, "");
  return output;
}

function extractFileUrl(file) {
  if (Array.isArray(file) && file[0]) {
    let output = [];

    file[0].forEach((element) => {
      let filelist = element && element.filelist && element.filelist[0];
      output.push(filelist);
    });
    return output;
  } else if (file) {
    let output = file && file.filelist && file.filelist[0];
    return output;
  }
  return null;
}
function GetBusinessInfo(business_site) {
  if (business_site) {
    let output = {
      ...business_site,
    };
    let business_profile = business_site.business_profile[0];

    if (business_profile) {
      output = {
        _id: business_site._id,
        section_name: business_profile.section_name,
        name: business_profile.name || business_site.name,
        opening_hours:
          business_site.opening_hours && business_site.opening_hours[0],
        formatted_address:
          business_profile.formatted_address || business_site.formatted_address,
        international_phone_number:
          business_profile.international_phone_number ||
          business_site.international_phone_number,
        website: business_profile.website || business_site.website,
        place_id: business_profile.place_id || business_site.place_id,
        geometry: business_profile.geometry || business_site.geometry,
        types: business_profile.types || business_site.types,
        logo: extractFileUrl(business_profile.logo),
        banner: extractFileUrl(business_profile.banner),
        poster: extractFileUrl(business_profile.poster),
        terms_conditions: business_profile.terms_conditions,
        privacy_policy: business_profile.privacy_policy,
        about_us: business_profile.about_us,
        b2c_commercial: business_profile.b2c_commercial,
        b2b_commercial: business_profile.b2b_commercial,
        career_commerical: business_profile.career_commerical,
      };
    }
    return output;
  }
  return null;
}

module.exports = {
  GetBusinessInfo,
  removeSpace,
};
