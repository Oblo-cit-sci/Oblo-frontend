export const default_licenses = [{
  short: "CC0",
  title: "No Rights Reserved",
  text: "No Rights Reserved",
  value: "CC0",
  description: "No Rights Reserved",
  orig_icon: "https://i.creativecommons.org/p/zero/1.0/88x31.png",
  icon: "cc_license/cc-zero.svg",
  rel: "https://creativecommons.org/publicdomain/zero/1.0/"
},
  {
    short: "C",
    title: "All rights reserved",
    text: "All rights reserved",
    value: "C",
    description: "",
    orig_icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/All_rights_reserved_white_logo.svg/240px-All_rights_reserved_white_logo.svg.png",
    icon: "cc_license/c.svg",
    rel: "https://en.wikipedia.org/wiki/All_rights_reserved"
  }]

const ld = require("lodash")

export function license_aspect(store, include = [], exclude) {
  const aspect = {
    name: "license",
    label: "License",
    type: "select",
    attr: {
      unpacked: true,
    },
    items: []
  }
  for (let license_group of include) {
    if (store.state.codes.hasOwnProperty(license_group)) {
      // `.values.licences` should be documentented somewhere or be more flexible
      const licence_entry = store.state.codes[license_group]
      const select_transform_keys = ld.get(licence_entry, "rules.edit.select_transform_keys", null)
      if (select_transform_keys) {
        aspect.items = ld.map(licence_entry.values.licenses, (l) => {
            const transformed = {}
            ld.forEach(select_transform_keys, (k, v) => {
              transformed[v] = l[k]
            })
            return Object.assign(transformed, l)
          }
        )
      } else {
        aspect.items = licence_entry.values.licenses
      }
    } else {
      console.log("cannot include license group", license_group)
    }
  }

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

export function privacy_aspect() {
  // debugger
  const aspect = {
    name: "privacy",
    description: "Should this entry be publicly visible?",
    label: "Privacy",
    type: "select",
    attr: {
      unpacked: true
    },
    items: [{
      text: "Public",
      description: "Everyone can see this entry.",
      value: "public",
      icon: "privacy/earth.png"
    }, {
      text: "Private",
      description: "Only you or users you shared the entry with can see it.",
      value: "private",
      icon: "privacy/lock-outline.png"
    }]
  }
  // todo privacy mode: something from the entry template rules en-foreces the privacy
  /*
        const privacy_set = this.template.rules.privacy
        return privacy_set ? VIEW : EDIT
   */

  return aspect
}


export function entry_roles_aspect() {
  const aspect = {
    name: "actors",
    label: "Collaborators and entry access",
    type: "entry_roles",
    attr: {
      unpacked: true
    }
  }

  return aspect
}

export function password_aspect() {
  return {
    type: "str",
    name: "password",
    label: "Password",
    attr: {
      max: 40,
      unpacked: true,
      component_type: "password",
      extra: {
        rules: [
          v => !!v || 'Password is required',
          v => v && (v.length >= 8) || 'Password must have at least 8 characters'
        ]
      }
    },
    value: "",
    error: true
  }
}

export function password_confirm_aspect() {
  return {
    type: "str",
    name: "repeat password",
    label: "Repeat password",
    attr: {
      max: 40,
      unpacked: true,
      component_type: "password",
      extra: {
      }
    },
    value: "",
    error: true
  }
}
