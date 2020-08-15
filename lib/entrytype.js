import {ASPECT, COMPONENT, EDIT, ENTRY, INDEX} from "~/lib/consts"

const ld = require("lodash")

export function aspect_by_name(e_type, aspect_name) {
  return ld.find(e_type.aspects, a => a.name === aspect_name)
}

export function aspect_from_location(store, aspect_loc) {

  let select = null
  for (let loc of aspect_loc) {

    const A_TYPE = loc[0]
    const A_VALUE = loc[1]

    const aspects_from_entry = (e) => store.getters["templates/entry_type"](e.template.slug).aspects

    if (A_TYPE === EDIT) {
      //console.log(EDIT, entries_mod)
      const entry = store.getters["entries/get_edit"]()
      select = aspects_from_entry(entry)
    } else if (A_TYPE === ENTRY) {
      const entry = store.getters["entries/get_entry"](A_VALUE)
      select = aspects_from_entry(entry)
    } else if(A_TYPE === ASPECT) {
      select = ld.find(select, aspect => aspect.name === A_VALUE)
    } else {
      console.log("warning: TODO, getting aspect_description for",A_TYPE)
    }
  }

  return select
}
