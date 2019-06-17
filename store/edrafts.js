import {find_aspect_with_name, findex_aspect_index_with_name} from "../lib/entry";

export const state = () => ({
  next_id: 0,
  drafts: {}
});

export const mutations = {
  create_draft(state, draft_data) {
    state.drafts[state.next_id] = draft_data;
    state.next_id++;
    console.log(state)
  },
  save_draft(state, draft_data) {
    state.drafts[draft_data.draft_id] = draft_data;
  },
  remove_draft(state, draft_id) {
    delete state.drafts[draft_id]
  },
  // data MUST have draft_id, aspect_name, value, OPTIONAL: index, ( and key)
  set_draft_aspect_value(state, data) { // for pageAspects and references entries to update the parent
    if (data.hasOwnProperty("index")) { // TODO or key
      state.drafts[data.draft_id].aspects_values[data.aspect_name].value[data.index] = data.value;
    } else {
      state.drafts[data.draft_id].aspects_values[data.aspect_name].value = data.value;
    }
  },
  set_draft_aspect_value_by_ref(state, data) {
    let draft = state.drafts[data.draft_id]
    // splice cuz
    //console.log("set from draft", draft)
    let select = draft
    let select_type = "entry"
    let select_type_obj = data.entry_type
    let aspect_refs = data.aspect_ref.split(".")
    aspect_refs.splice(0,1)
    //console.log(aspect_refs, select_type_obj)
    for(let ar_index in aspect_refs){
      let ar = aspect_refs[ar_index]
      console.log(ar, ar_index, aspect_refs.length)
      if (select_type === "entry") {
        if(parseInt(ar_index) === aspect_refs.length - 1) {
          console.log("last set, s", select)
          select.aspects_values[ar] = data.value
        } else {
          select = select.aspects_values[ar]
        }
        //select = select.aspects_values[ar]
        //history.push(select)
        select_type = "aspect"
        select_type_obj = find_aspect_with_name(select_type_obj.content.aspects, ar)
        console.log("entry>", select, select_type, select_type_obj)
      } else if(select_type === "aspect") {
        // check list or composite or ...
        const aspect_type = select_type_obj.type
        if(aspect_type === "list") {
          select = select.value[parseInt(ar) - 1] // -1 cuz, it takes the name, all names start with 1 (for the user)
          select_type = "aspect"
          select_type_obj = select_type_obj.items
          console.log("aspect/list", select, select_type, select_type_obj)
        } else if(aspect_type === "composite") {
          const component_index = findex_aspect_index_with_name(select_type_obj.components, ar)
          if(parseInt(ar_index) === aspect_refs.length - 1) {
            console.log("last set")
            select.value[component_index] = data.value
          } else {
            select = select.value[component_index]
          }
          select_type = "aspect"
          select_type_obj = find_aspect_with_name(select_type_obj.components, ar)
          console.log("aspect/composite", select, select_type, select_type_obj)
        } else {
          console.log("ERROR edrafts/set_draft_aspect_value_by_ref unknown type", aspect_type)
        }
      }
    }
    //select = data.value
    console.log("result select", select,select_type, data.value)
    //select = data.value
    console.log(draft.aspects_values)
  },

  /*
  if (aspect_descr.attr.value) {
    const val = aspect_descr.attr.value
    if (val.startsWith("#")) { // a reference attribute
      let access = val.split(".")
      let select = entry
      let select_type = "entry"
      //let history = [select]
      if (access[0].length > 1) { // first access is # and eventual one or more "/"
        // for now we assume its all just "/" chars
        for (let up of Array(access[0].length - 1).keys()) {
          select = get_local_entry(store, select.ref)
          //history.push(select)
        }
      }
      access.splice(0, 1)
      for (let c of access) {
        if (select_type === "entry") {
          select = select.aspects_values[c]
          //history.push(select)
          select_type = "aspect"
        }
        // todo
        if (select_type === "aspect") {
          // here composite and list access
        }
      }
      if (select_type === "aspect") {
        return JSON.parse(JSON.stringify(select))
      } else {
        return null
      }
    }
  }


   */

  add_reference(state, reference_info) {
    state.drafts[reference_info.draft_id].ref = reference_info.ref
  },
  set_downloaded(state, draft_id) {
    console.log(state.drafts, draft_id)
    state.drafts[draft_id].downloaded_version = state.drafts[draft_id].version
  },
  clear(state){
    state.drafts = {}
    state.next_id = 0
  }
};


/// TODO FUCK WONT WORK !?!?
/*
export const getters = {
  // cuz they are stored as array but we access by name
  // HOW DO WE ACCESS THESE???

  drafts_by_slug(state, getters) {
    return (type_slug) => {
      return ld.filter(state.drafts, (d) => {
        return d.type_slug === type_slug
      })
    }
  },
  all_drafts(state) {
    return state.drafts
  }
}
*/
