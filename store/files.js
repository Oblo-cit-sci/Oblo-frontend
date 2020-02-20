export const state = () => ({
  files: {}, // base64
});

// commmit
export const mutations = {
  add_file(state, {uuid, data}) {
    state.files[uuid] = data
  },
  remove_file(state, uuid) {
    delete state.files[uuid]
  }
}

export const getters = {
  get_file(state) {
    return (uuid) => {
      return state.files[uuid]
    }
  }
}

