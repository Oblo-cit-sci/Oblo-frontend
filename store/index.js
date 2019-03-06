export const state = () => ({
  counter: 0,
  user: {
    "public name" : "ramin",
    "username": "ramin",
    "location": "barcelona"
  },
  global_role: "admin",
  actual_location: {
    country: "",
    site: "",
  },
  default_license: "",
  default_privacy: ""
});

export const mutations = {
  increment (state) {
    state.counter++
  }
};
