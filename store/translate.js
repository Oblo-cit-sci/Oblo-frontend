import {MENU_MODE_DOMAIN} from "~/lib/consts";

export const state = () => ({
    component: null,
    src_lang: null,
    dest_lang: null,
    messages: [],
  }
)

export const mutations = {
  set_component(state, src_lang) {
    state.component = src_lang
  },
  set_src_lang(state, src_lang) {
    state.src_lang = src_lang
  },
  set_dest_lang(state, src_lang) {
    state.dest_lang = src_lang
  },
  set_messages(state, messages) {
    state.messages = messages
  }
}

export const actions = {
  setup({commit}, {component, src_lang, dest_lang, messages}) {
    commit("set_component", component)
    commit("set_src_lang", src_lang)
    commit("set_dest_lang", dest_lang)
    commit("set_messages", messages)
  }
}

export const getters = {
  translation(state) {
    return state
  }
}
