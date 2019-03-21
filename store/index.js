export const state = () => ({
  logged_in: false,
  user_data: {}
});

export const mutations = {
  login(state, user_data) {
    state.logged_in = true;
    state.user_data = user_data;
  },
  logout(state) {
    state.logged_in = false;
    state.user_data = {};
  },
  set_user_data(state, user_data) {
    state.user_data = user_data;
  }
};
