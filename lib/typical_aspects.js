import {ENTRY, META} from "~/lib/consts";

export const default_licenses = [{
  "short": "CC0",
  "title": "No Rights Reserved",
  text: "No Rights Reserved",
  value: "CC0",
  "description": "No Rights Reserved",
  "orig_icon": "https://i.creativecommons.org/p/zero/1.0/88x31.png",
  "icon": "cc_license/cc-zero.svg",
  "rel": "https://creativecommons.org/publicdomain/zero/1.0/"
},
  {
    "short": "C",
    "title": "All rights reserved",
    text: "All rights reserved",
    value: "C",
    "description": "",
    "orig_icon": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/All_rights_reserved_white_logo.svg/240px-All_rights_reserved_white_logo.svg.png",
    "icon": "cc_license/c.svg",
    "rel": "https://en.wikipedia.org/wiki/All_rights_reserved"
  }]

const ld = require("lodash")

export function license_aspect(store, include = [], exclude, add_entry_loc_uuid) {
  // debugger
  const aspect = {
    name: "license",
    label: "License",
    type: "select",
    attr: {
      unpacked: true
    },
    items: []
  }
  for (let license_group of include) {
    if (store.state.codes.hasOwnProperty(license_group)) {
      // `.values.licences` should be documentented somewhere or be more flexible
      const licence_entry = store.state.codes[license_group]
      const select_transform_keys = ld.get(licence_entry, "rules.edit.select_transform_keys", null)
      aspect.items = licence_entry.values.licences
      if (select_transform_keys) {
        aspect.items = ld.map(licence_entry.values.licences, (l) => {
            const transformed = {}
            ld.forEach(select_transform_keys, (k, v) => {
              transformed[v] = l[k]
            })
            return Object.assign(transformed, l)
          }
        )
      }
    } else {
      console.log("cannot include license group", license_group)
    }
  }

  if(add_entry_loc_uuid) {
    aspect.aspect_loc = [[ENTRY, add_entry_loc_uuid], [META, "license"]]
  }
  console.log("LIC", aspect)
  return aspect
}

export function cc_license_aspect(store) {
  if (!store.state.codes.hasOwnProperty("cc_licenses")) {
    return
  }
  return {
    items: this.$_.map(store.state.codes.cc_licenses.values.licenses, (l) => Object.assign({
      text: l.title,
      value: l.short
    }, l))
  }
}
