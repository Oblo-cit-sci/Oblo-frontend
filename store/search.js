import {string_list2options} from "../lib/options";

export const state = () => ({
  entries: new Map()
});

export const mutations = {
  set_entries(state, entries) {
    state.entries = new Map(entries)
  },
  clear(state) {
    // yes, instead of state.entries.clear(), which won't trigger any update
    state.entries = new Map()
  }
}

export const getters = {
  get_entries(state) {
    return Array.from(state.entries.values())
  },
  conaining_types_options(state, getters, rootState, rootGetters) {
    const types = new Set()
    for (let entry of state.entries.values()) {
      types.add(entry.type_slug)
    }
    return Array.from(types).map(type => {
      return {value: type, text: rootGetters.type_name(type)}
    })
  }
}
