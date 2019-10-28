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
    }
}
