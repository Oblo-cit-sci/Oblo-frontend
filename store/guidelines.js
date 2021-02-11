import {NO_DOMAIN} from "~/lib/consts";

const ld = require("lodash")

export const state = () => ({
  guidelines_closed: {}
})


export const mutations = {
  close_guideline(state, guideline) {
    ld.set(state.guidelines_closed, guideline, true)
  }
}


export const getters = {
  is_guideline_closed(state) {
    return (guideline) => {
      return ld.get(state.guidelines_closed, guideline, false)
    }
  }
}
