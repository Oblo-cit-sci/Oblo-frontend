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
        return Array.from(state.entries.values())
    }
}
