import {privacy_aspect} from "~/lib/typical_aspects"
// todo replace entries_domain_filter2 by something generalized and nicer, see function...

export const domain_filter_options = {
  name: "Domain",
  store_getter: "domain_options",
  filter_method: "domain",
  init_getter: "domain",
  placeholder: "All domains"
}


export const entrytype_filter_options = {
  name: "template",
  label: "Entrytype",
  aspect: {
    name: "template_slug",
    label: "Entrytype",
    type: "select",
    attr: {
      min: 1,
      unpacked: true
    },
    options: []
  },
  search_config: {
    name: "template",
  }
}

export const privacy_filter_options = {
  name: "privacy",
  label: "Privacy",
  placeholder: "Any privacy",
  aspect: privacy_aspect(),
  search_config: {
    name: "meta",
    column: "privacy"
  }
}

export const license_filter_options = {
  name: "license",
  label: "License",
  options: ["Public domain", "Creative commons", "All rights reserved"]
}

