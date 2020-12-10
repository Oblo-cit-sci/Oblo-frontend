import {COMPOSITE, LIST} from "~/lib/consts";
import {entries_domain_filter} from "~/lib/search";
import {resolve_from_list_code, resolve_from_tree_code} from "~/lib/tags";

const ld = require("lodash")

export const state = () => ({
  /**
   * slug as key
   * value: slug, domain, langs
   * lang -> where complete templates go in
   * lang.en = ...
   */

  entry_types: new Map(), // types for creation
  codes: new Map(),
  tags: {}
})


export const getters = {
  entry_type(state) {
    // todo should have a 2nd parameter for language
    return (type_slug, language, fallback = true) => {
      // console.log("getting entry_type for slug", type_slug, state.entry_types)
      if (!state.entry_types.has(type_slug)) {
        console.log("WARNING, store,entrytype.getters.entry_type: type for slug missing", type_slug, "returning null, should be catched earlier")
        return null
      }
      const base_template = state.entry_types.get(type_slug)
      if (base_template.lang.hasOwnProperty(language)) {
        return base_template.lang[language]
      } else if (fallback) {
        return base_template.lang[Object.keys(base_template.lang)[0]]
      } else {
        return null
      }
    }
  },
  has_code(state, getters) {
    return (type_slug, language) => getters.code(type_slug, language) !== null
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
  codes(state) {
    return Array.from(state.codes.values())
  },
  codes_in_language(state, getters) {
    return language => getters.codes.map(c => getters.code(c.slug, language))
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
  templates_of_domain(state, getters) {
    return (domain_name, language) => {
      const domain_templates = entries_domain_filter(Array.from(state.entry_types.values()), domain_name).map(t => t.slug)
      return domain_templates.map(t => getters.entry_type(t, language))
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
  entry_types_array(state, getters) {
    return (language, fallback) => {
      const lang = language || "en" // language should not be missing, but rather when this getter is called, be set...
      return Array.from(state.entry_types.values()).map(d => getters.entry_type(d.slug, lang, fallback)).filter(e => e != null)
    }
  },
  tags_of_code(state) {
    return (code_slug, language, tag_values) => {
      console.log(code_slug, language, tag_values)

      if (!state.tags[code_slug]) {
        console.log("templates/tags_of_code: no tags for entry_slug", code_slug)
        console.log("options:", state.tags)
        return tag_values
      }
      const entry_tags = state.tags[code_slug]
      return ld.map(tag_values, v => {
        if (!entry_tags[v]) {
          console.log("templates/tags_of_code: no tag for slug, value", code_slug, v)
          console.log("options:", entry_tags)
          return v
        } else {
          if (entry_tags[v].has(language)) {
            return entry_tags[v].get(language).text
          } else {
            console.log("templates/tags_of_code: no tag for slug, value, language", code_slug, v, language)
            console.log("options", entry_tags[v].keys(), "->", entry_tags[v].values().next().value)
            return entry_tags[v].values().next().value.text
          }
        }
      })
    }
  }
}

export const mutations = {
  insert_template_code(state, t_c) {
    const insert_into = t_c.type === "template" ? state.entry_types : state.codes
    if (insert_into.has(t_c.slug)) {
      insert_into.get(t_c.slug).lang[t_c.language] = t_c
    } else {
      insert_into.set(t_c.slug, {
        slug: t_c.slug,
        domain: t_c.domain,
        lang: {
          [t_c.language]: t_c
        }
      })
    }
  },
  add_tags_from(state, entry) {
    if (_.isEmpty(entry.rules.tags))
      return;
    const tags_rule = entry.rules.tags
    let tags = null

    if (tags_rule["from_tree"]) {
      tags = resolve_from_tree_code(entry)
    } else if (tags_rule["from_list"]) {
      tags = resolve_from_list_code(entry)
    }
    if (tags) {
      if (!state.tags[entry.slug]) {
        state.tags[entry.slug] = {}
      }
      const insert_to = state.tags[entry.slug]
      const lang = entry.language
      console.log("insert tag for: ", entry.slug, lang)
      for (let tag of tags) {
        if (!insert_to[tag.value]) {
          insert_to[tag.value] = new Map()
        }
        insert_to[tag.value].set(lang, {text: tag.text})
        if (tag.description) {
          insert_to[tag.value].get(lang)[description] = tag.description
        }
      }
    }
  }
}

export const actions = {
  add_templates_codes({commit}, arr) {
    for (let t_c of arr) {
      commit("insert_template_code", t_c)
      if (t_c.type === "code") {
        commit("add_tags_from", t_c)
      }
    }
  }
}
