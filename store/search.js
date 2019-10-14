export const state = () => ({
    entries: new Map()
});

export const mutations = {
    set_entries(state, entries) {
        state.entries = new Map(entries)
    }
}

export const getters = {
    get_entries(state) {
        return state.entries
    }
}
