import {COMPOSITE, LIST} from "~/lib/consts";
import {entries_domain_filter} from "~/lib/search";

const ld = require("lodash")

export const state = () => ({
  /**
   * slug as key
   * value: slug, domain, langs
   * lang -> where complete templates go in
   * lang.en = ...
   */

  entry_types: new Map(), // types for creation
  codes: new Map()
})


export const getters = {
  entry_type(state) {
    // todo should have a 2nd parameter for language
    return (type_slug, language) => {
      // console.log("getting entry_type for slug", type_slug, state.entry_types)
      if (!state.entry_types.has(type_slug)) {
        console.log("WARNING, store,entrytype.getters.entry_type: type for slug missing", type_slug, "returning null, should be catched earlier")
      }
      const base_template = state.entry_types.get(type_slug)
      if (base_template.lang.hasOwnProperty(language)) {
        return base_template.lang[language]
      } else {
        return base_template.lang[Object.keys(base_template.lang)[0]]
      }
    }
  },
  has_code(state, getters) {
    return(type_slug, language) => {
      getters.code !== null
    }
  },
  code(state) {
    return (type_slug, language) => {
      // console.log("getting entry_type for slug", type_slug, state.entry_types)
      if (!state.codes.has(type_slug)) {
        console.log("WARNING, store,entrytype.getters.entry_type. type for slug missing:", type_slug, "returning null, should be catched earlier")
        return null
      }
      const base_template = state.codes.get(type_slug)
      if (base_template.lang.hasOwnProperty(language)) {
        return base_template.lang[language]
      } else {
        return base_template.lang[Object.keys(base_template.lang)[0]]
      }
    }
  },
  template_title(state, getters) {
    return (slug, language) => {
      // console.log("typename of ", slug)
      const etype = getters.entry_type(slug, language)
      if (etype) {
        return etype.title
      } else {
        console.log("WARNING: type for unknown slug requested", slug)
        return "unknown type:" + slug
      }
    }
  },
  templates_of_domain(state, geters) {
    return (domain_name, language) => {
      const domain_templates = entries_domain_filter(Array.from(state.entry_types.values()), domain_name).map(t => t.slug)
      return domain_templates.map(t => geters.entry_type(t, language))
    }
  },
  get_aspect_def(state, getters) {
    return ({type_slug, aspect_name}) => {
      let type = getters.entry_type(type_slug)
      return type.aspects.find(a => {
        return a.name === aspect_name
      })
    }
  },
  entry_types_array(state) {
    return language => (Array.from(state.entry_types.values()).map(d => d.lang[language || "en"]))
  }
}

export const mutations = {
  add_templates_codes(state, arr) {
    for (let t_c of arr) {
      console.log(t_c)
      const insert = t_c.type === "template" ? state.entry_types : state.codes
      if (insert.has(t_c.slug)) {
        insert.get(t_c.slug).lang[t_c.language] = t_c
      } else {
        insert.set(t_c.slug, {
          slug: t_c.slug,
          domain: t_c.domain,
          lang: {
            [t_c.language]: t_c
          }
        })
      }
    }
  }
}
