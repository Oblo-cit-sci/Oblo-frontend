export const state = () => ({
  //
  //entries: new Map(),
  tempM: new Map([["kslakl", 3]])
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
  }
}

export const getters = {
  tempM(state) {
    return state.tempM
  }
}

export const actions = {
  add(context, val) {
    context.commit("add", val)
    context.commit("update")
  },
  mut(context, val) {
    context.commit("mut", val)
    context.commit("update")
  },
  del(context) {
    context.commit("del")
    context.commit("update")
  }
}
