import {MENU_MODE_DOMAIN} from "~/lib/consts"

export const state = () => ({
    open: false,
    menu_state: MENU_MODE_DOMAIN,
    menu_width: null
  }
)

export const mutations = {
  menu_state(state, menu_state) {
    state.menu_state = menu_state
  },
  menu_width(state, menu_width) {
    state.menu_width = menu_width
  },
  open(state, open) {
    state.open = open
  },
  switch_open(state) {
    state.open = !state.open
  },
}
export const getters = {
  menu_state(state) {
    return state.menu_state
  },
  menu_width(state) {
    return state.menu_width
  },
  open(state) {
    return state.open
  },
}
