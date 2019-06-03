/*
  this is for the user (and maybe others)
 */

let default_user_data = {
  global_role: "visitor",
  registered_name: "visitor", // TODO should also retrieve that... with a number index
  // https://stackoverflow.com/questions/1253499/simple-calculations-for-working-with-lat-lon-km-distance
  // of 1 degree will result in error of around 50km per coordinate -0.5, +0.5 degree change around the real location
  location_error: 2,
  defaultLicense: "CC0", // should come from the server
  defaultPrivacy: "public",
  location: ""
}


export const state = () => ({
  logged_in: false,
  user_data: default_user_data,
})


export const mutations = {
  login(state, data) {
    //console.log("LOGIN");
    //console.log("store data", data.own_entries);
    state.logged_in = true;
    state.user_data = data.user_data;
  },
  logout(state) {
    state.logged_in = false;
    state.user_data = default_user_data;
  },
  set_user_data(state, user_data) {
    state.user_data = user_data;
  },
}
