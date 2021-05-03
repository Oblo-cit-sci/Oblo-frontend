import {MENU_MODE_DOMAIN} from "~/lib/consts";

export const state = () => ({
    setup: {
      component: null,
      entry: null,
      src_lang: null,
      dest_lang: null,
      messages: [],
      config: {}, // which domain:xxx, slug:xxx, new_o:bool
      unpacked: {} // unpacked values to show them on the next page }
    }
  }
)

export const mutations = {
  setup(state, data) {
    console.log("mutset")
    state.setup = data
  }
}


export const getters = {
  setup_values(state) {
    return state.setup
  },
  packed_values(state) {
    return state.setup.unpacked
  }
}
