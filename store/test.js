import {ASPECT, COMPONENT, ENTRY, INDEX} from "../lib/consts";

const ld = require("lodash")

export const state = () => ({
  edit: new Map()
});

export const mutations = {
  add(state, val) {
    state.tempM.set("dklasd"+ val.toString(), val)
    //state.tempM = new Map(state.tempM.entries())
  },
  mut(state, val) {
    let m = Array.from(state.tempM.entries())[0]
    state.tempM.set(m[0], val)
  },
  del(state) {
    let m = Array.from(state.tempM.entries())[0]
    state.tempM.delete(m[0])
  },
  update(state) {
    state.tempM = new Map(state.tempM.entries())
    state.edit = new Map(state.edit.entries())
  },
  create(state, entry) {
    state.edit.set(entry.uuid, entry)
  },
  _set_entry_value(state, {aspect_loc, value}) {
    //let entry = state.edit.get(aspect_loc[0][1])

    let select = null
    const final_loc = ld.last(aspect_loc)
    for (let loc of aspect_loc) {
      if (loc[0] === "entry") {
        select = state.edit.get(loc[1]).aspects_values
      }
      //console.log(select)
      if(loc === final_loc) {
        break
      }
    }

    if (final_loc[0] === ASPECT) {
      //select.set(inal_loc[1]) = value
      if (!select.hasOwnProperty(final_loc[1])) {
        console.log("error setting value", aspect_loc, loc)
      }
      select[final_loc[1]] = value
    }

/*
    } else { // INDEX
      // push new value
      if (select.value.length === final_loc[1]) {
        // todo here could be a check if loc1 is length
        select.value.push(value)
      } else {
        select.value[final_loc[0]] = value
      }
    }
    */
  }
}

export const getters = {
  tempM(state) {
    return state.tempM
  },
  entry(state) {
    return (uuid) => {
      //console.log("getter called")
      return state.edit.get(uuid)
    }
  },
  value(state) {
    return(aspect_loc) => {
      let select = null
      console.log("value?", aspect_loc)
      for (let loc of aspect_loc) {
        console.log("loc", select, loc)
        if (loc[0] === ENTRY) {
          select = state.edit.get(loc[1]).aspects_values
        } else if(loc[0] === ASPECT) {
          select = select[loc[1]]

        } else if(loc[0] === COMPONENT) {
          select = select.value[loc[1]]
        } else if(loc[0] === INDEX) {
          select = select.value[loc[1]]
        }
        console.log("se--l", select)
      }
      console.log("res", select)
      return select
    }
  }
}

export const actions = {
  add({commit}, val) {
    commit("add", val)
    commit("update")
  },
  mut({commit}, val) {
    commit("mut", val)
    commit("update")
  },
  del({commit}) {
    commit("del")
    commit("update")
  },
  create({commit}, entry) {
    commit("create", entry)
  },
  set_entry_value({commit}, data) {
    commit("_set_entry_value", data)
    commit("update")
  }
}
