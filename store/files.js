export const FILES_ADD_FILE = "files/add_file"
export const FILES_GET_FILE = "files/get_file"

export const state = () => ({
  files: {}, // base64
});

// commmit
export const mutations = {
  add_file(state, {uuid, meta, data}) {
    state.files[uuid] = {meta, data}
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

