import {
  ASPECT, COLLECT, COLLECT_CLOSE,
  COMPONENT,
  DRAFT, EDIT,
  ENTRY,
  ENTRY_COLLECT, ENTRY_COLLECT_CLOSE, ENTRY_COLLECT_LINK,
  ENTRY_INDEX, ENTRY_LINK_FOLLOW,
  INDEX, LICCI_PARTNERS, LIST,
  PARENT,
  PRIVATE_LOCAL,
  STR,
  TITLE_ASPECT, VIEW
} from "./consts"
import {ENTRIES_SAVE_ENTRY, ENTRYTYPES_TYPE, ENTRYTYPES_TYPENAME, UPDATE_DRAFT_NUMBER, USER_GET_USER_DATA} from "./store_consts";
import {aspect_default_value, aspect_loc_str2arr, pack_value} from "./aspect";

import {user_ref} from "./actors";
import {get_release_mode, recursive_unpack} from "./util";

const pkg = require('../package')

// todo should come from nuxt.config.js : config.aspect_select_debug
const DEBUG = true
const DEV_TRIGGER_EXCEPTION = false

const ld = require("lodash")
const uuidv4 = require('uuid/v4')


export function create_entry(store, type_slug, init = {}, parent = null) {
  // todo different owner in case of visitor
  // console.log("entry of type_slug", type_slug)
  const template = store.getters[ENTRYTYPES_TYPE](type_slug)
  // console.log("type of type_slug",template)
  const draft_no = get_update_draft_no(store, type_slug)

  store.dispatch("user/guarantee_uuid")
  const user_data = store.getters[USER_GET_USER_DATA]
  const title = init.title || template.title + " " + draft_no

  //console.log("ET", template)
  const entry = {
    //template: init.entry_type, // maybe out later...
    type_slug: type_slug,
    draft_no: draft_no, // todo. local
    values: init.values || default_values(template),
    license:
      template.rules.license ? template.rules.license :
        (template.rules.privacy === PRIVATE_LOCAL ? "None" : user_data.defaultLicense),
    privacy: template.rules.privacy ? template.rules.privacy : user_data.defaultPrivacy,
    title: title,
    refs: {
      parent: parent,
      children: {}
    }, // ne
    status: DRAFT, // todo should go to local
    uuid: uuidv4(),
    version: 0,
    local: { // local stuff that wont go to the server
      dirty: false,
      prev: null,
      //downloaded
      //draft_no
    },
    location: init.location || null,
    actors: {
      creator: user_ref(user_data),
      owners: get_release_mode(store) === LICCI_PARTNERS ? [] : [user_ref(user_data)]
    },
    parent_type_version: template.version,
    app_version: pkg.version,
    domain: template.domain,
    downloads: false, // todo: should go to local
    creation_datetime: new Date()
  }
  if (template.rules.titleAspect) {
    // is this the best way to check something and have a default of
    // set title aspect.default true
    if (template.rules.hasOwnProperty("setTitleAspect")) {
      if (template.rules.setTitleAspect) {
        set_titleAspect(store, entry)
      }
    } else {
      set_titleAspect(store, entry)
    }
  }

  return entry
}

export function set_titleAspect(store, entry) {
  const template = store.getters[ENTRYTYPES_TYPE](entry.type_slug)
  let set_aspect = template.rules.hasOwnProperty("set_aspect") ? template.rules.set_aspect : true
  if (set_aspect) {
    const loc_arr = aspect_loc_str2arr(template.rules.titleAspect)
    let title_val = select_aspect_loc(null, loc_arr, false, entry.values)
    title_val.value = entry.title
  }
}

// todo, this should be in the store. but it needs to work for both getting and setting
export function select_aspect_loc(entries_mod, aspect_loc, skip_final = false, select = null) {
  if (DEBUG) {
    console.log("select_aspect_loc", aspect_loc)
  }
  let pre_select = null
  //let select = null
  //console.log("select_aspect_loc", aspect_loc)
  const final_loc = ld.last(aspect_loc)

  let skip_collect = false
  let skip_entry_collect = false
  for (let loc of aspect_loc) {
    if (DEBUG) {
      console.log("loc", loc)
    }
    if (select) {
      pre_select = select
    }
    try {
      //console.log("->", select, loc, "sc", skip_collect, "sec", skip_entry_collect)
      const A_TYPE = loc[0]
      const A_VALUE = loc[1]
      // ** CLOSE COLLECTORS
      if (skip_final && loc === final_loc) {
        break
      }
      if (skip_collect) {
        if (A_TYPE === COLLECT_CLOSE) {
          //console.log(COLLECT_CLOSE)
          skip_collect = false
        }
      } else if (skip_entry_collect) {
        if (A_TYPE === ENTRY_COLLECT_CLOSE) {
          //console.log(ENTRY_COLLECT_CLOSE)
          skip_entry_collect = false
        }
        // **
      } else if (A_TYPE === EDIT) {
        //console.log(EDIT, entries_mod)
        select = entries_mod.edit.values
      } else if (A_TYPE === ENTRY) {
        select = entries_mod.entries.get(A_VALUE).values
      } else if (A_TYPE === PARENT) {
        const number_of_levels = parseInt(A_VALUE)
        // start from the 1.
        // todo this is a getter, no?
        // todo this is also problematic for EDIT, it always needs the uuid
        let entry = entries_mod.entries.get(aspect_loc[0][1]) // this entry
        if (aspect_loc[0] === EDIT && !entry) {
          console.log("no entry in PARENT, probably due to edit as 1. entry")
        }
        if (number_of_levels) {
          for (let i = 0; i < number_of_levels; i++) {
            entry = entries_mod.entries.get(entry.refs.parent.uuid)
          }
        } else { // A_VALUE is not a number.
          //console.log("access parent by slug",A_VALUE)
          //console.log(entry.title, entry, entry.type_slug)
          while (entry.type_slug !== A_VALUE) {
            // check here if parent doesnt exists
            entry = entries_mod.entries.get(entry.refs.parent.uuid)
            // console.log("checking type", entry.title, entry.type_slug, A_VALUE, "?")
          }
        }
        select = entry.values
      } else if (A_TYPE === ASPECT) {
        select = select[A_VALUE]
      } else if (A_TYPE === COMPONENT) {
        select = select.value[A_VALUE]
      } else if (A_TYPE === INDEX) {
        // console.log(INDEX, select, loc)
        if (A_VALUE >= select.value.length) {
          console.log("lib.entry.value: index out of bounds", A_VALUE, "length:", select.value.length)
          return pack_value(null)
        }
        select = select.value[A_VALUE]
      } else if (A_TYPE === ENTRY_INDEX) {
        select = entries_mod.entries.get(select.value[A_VALUE])
        if (!select) {
          console.log("lib.entry.value: no value at entry-index", A_VALUE)
          return pack_value(null)
        } else {
          select = select.values
        }
      } else if (loc[0] === COLLECT) {
        let collect_over_list = select.value
        if (DEBUG) {
          console.log(COLLECT, " over list", collect_over_list)
        }
        // might be a list of basic types or a list of composite, check aspect_loc
        let reduced_loc = ld.takeWhile(ld.takeRightWhile(aspect_loc, al => {
            return al !== loc
          }
        ), al => {
          return al[0] !== COLLECT_CLOSE
        })
        if (DEBUG) {
          console.log(COLLECT, "reduced_loc", reduced_loc)
        }
        if (reduced_loc.length === 0) {
          // TODO simple type, done? TEST
          return collect_over_list
        } else if (reduced_loc.length === 1) {
          let collected = ld.map(collect_over_list, comp => {
            return comp.value[reduced_loc[0][1]]
          })
          collected = ld.filter(collected, v => (!!v))
          //console.log(COLLECT, "collected", collected)
          select = {value: collected, list: true}
          //console.log("collected", select)
          skip_collect = true
        } else {
          console.log("non-tested collect, larger aspect_loc")
        }
      } else if (A_TYPE === ENTRY_COLLECT || A_TYPE === ENTRY_COLLECT_LINK) {
        /*
          [ ENTRY_COLLECT
          > ENTRY_COLLECT_LINK
         */
        //console.log(ENTRY_COLLECT, "!", select, aspect_loc)
        select = select[A_VALUE]
        let reduced_loc = ld.takeRightWhile(aspect_loc, al => {
          return al !== loc
        })
        reduced_loc = ld.takeWhile(reduced_loc, al => {
          return al[0] !== ENTRY_COLLECT_CLOSE
        })
        // console.log(ENTRY_COLLECT, "reduced_loc", reduced_loc)
        let collected = []
        // this turns list of entry-selects into entrylists, which are list of uuids.
        // todo lists of entry-selects can have unregular values, they should not be allowed or filtered out here
        const unpacked = recursive_unpack(select.value)

        unpacked.forEach(e_uuid => {
          // todo isnt this just the complete ... call
          let entry_loc = ld.concat([[ENTRY, e_uuid]], reduced_loc)
          let val = select_aspect_loc(entries_mod, entry_loc)
          //console.log(ENTRY_COLLECT, "e-val", val)
          // todo, check if required, maybe concat manages it
          if (val[LIST]) {
            if (A_TYPE === ENTRY_COLLECT_LINK) {
              // console.log(val)
              val.value = ld.map(val.value, v => {
                return {value: e_uuid, text: v.value}
              })
              // TODO: NOT TESTed
              val.value = ld.filter(val.value, v => v.value !== null)
              //console.log("<", val)
              collected = ld.concat(collected, val.value)
            } else {
              //console.log("adding val", val)
              const new_values = ld.map(val.value, v => {
                return v.value
              })
              collected = ld.concat(collected, new_values)
              //console.log("collected", collected)
            }
          } else {
            if (A_TYPE === ENTRY_COLLECT_LINK) {
              if (val.value) {
                // todo, shouldnt have a text?
                collected = ld.concat(collected, {value: e_uuid, text: val.value})
              }
            } else {
              collected = ld.concat(collected, val)
            }
          }
        })
        // console.log("collected", collected)
        skip_entry_collect = true
        select = pack_value(collected)
      } else if (A_TYPE === ENTRY_LINK_FOLLOW) {
        if (!select || !select.value) {
          return pack_value(null)
        } else {
          select = entries_mod.entries.get(select.value).values
        }
      } else {
        console.log("ERROR store.entries.  select ", select, "location", loc)
      }
    } catch (e) {
      console.log("entry.select_aspect_loc failed for select:", select, "with location:", loc, "aspect_loc", aspect_loc, "options", pre_select)
      if (process.env.NODE_ENV !== "production" && DEV_TRIGGER_EXCEPTION)
        throw "entry.select_aspect_loc failed for select:" + select + "with location:" + loc + "aspect_loc" + aspect_loc
      else
        return pack_value(null)
    }
    if (DEBUG) {
      console.log("select", select)
    }
    if (!select) {
      debugger
      console.log("SELECT failed for", "select:", select, loc, "options", pre_select, "aspect_loc", aspect_loc,)
      return undefined
    }
  }
  // console.log("returning", select)
  return select
}

// TODO DEPR. doc: none titleAspect etypes always set the name to ename +  <NUMBER OF ENTRIES>
export function get_entry_titleAspect(template) {
  if (template.rules.hasOwnProperty(TITLE_ASPECT)) {
    return template.rules.titleAspect
  } else {
    if (template.aspects[0].type === STR) {
      return "# " + template.aspects[0].name
    } else {
      //console.log("WARNING: no proper titleAspect for the type", entry_type.title)
      return null
    }
  }
}


export function get_update_draft_no(store, template) {
  // template is type_slug
  const draft_no = store.getters.draft_no(template) + 1
  store.commit(UPDATE_DRAFT_NUMBER, template)
  return draft_no
}


export function default_values(template) {
  let values = {}
  let aspects = template.aspects
  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
    //console.log("lib/entry: default value of aspect", aspect)
    values[aspect.name] = aspect_default_value(aspect)
  }
  return values
}

export function current_user_is_owner(store, entry) {
  return ld.find(entry.actors.owners, (o) => o.registered_name === store.state.user.user_data.registered_name)
}

export async function fetch_entry(store, axios, uuid) {
  return axios.get("/entry/" + uuid)
}


export function has_parent(entry) {
  return entry.refs.parent !== null
}

export function has_pages(template) {
  return template.rules.hasOwnProperty("pages")
}


export function get_proper_mode(store, entry) {
  return VIEW

  // if (entry.privacy === PRIVATE_LOCAL) {
  //   return EDIT
  // } else {
  //   const user_rights = store.getters['entries/user_rights'](undefined, entry.uuid)
  //   const status = store.getters['entries/get_status'](entry.uuid)
  //   if (user_rights === EDIT && status === DRAFT) {
  //     return EDIT
  //   } else {
  //     return VIEW
  //   }
  // }
}

export function full_name(store, entry) {
  return store.getters[ENTRYTYPES_TYPENAME](entry.type_slug) +": "+  entry.title
}
