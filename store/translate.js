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
    },
    user_guide_links: {}  // for the menu
  }
)

export const mutations = {
  setup(state, data) {
    state.setup = data
  },
  add_user_guide_link(state, {language_code, url}) {
    state.user_guide_links[language_code] = url
  }
}


export const getters = {
  setup_values(state) {
    return state.setup
  },
  packed_values(state) {
    return state.setup.unpacked
  },
  user_guide_link(state) {
    return (language_code) => {
      return state.user_guide_links[language_code]
    }
  }
}
