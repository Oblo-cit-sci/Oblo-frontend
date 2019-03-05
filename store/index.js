export const state = () => ({
  counter: 0,
  global_role: "admin",
  ui_text: {
    "site": "Site",
    "village": "Village",
    "investigator": "Investigator",
    "village_info_card": "Village Information Card",
    "focus_group": "Focus Group Discussion"
  }
});

export const mutations = {
  increment (state) {
    state.counter++
  }
};
