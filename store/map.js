export const state = () => ({
  marker: null,
})

export const mutations = {
  marker_point(state, coordinate) {
    state.marker = coordinate
  }
}
