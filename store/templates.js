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
  tags: {},
  //requested: {} // key: domain, values: Set of lang, to prevent reloading
})

export const getters = {
  entry_type(state) {
    return (type_slug, language, fallback = true, show_warning = true) => {
      // console.log("getting entry_type for slug", type_slug, state.entry_types)
      if (!state.entry_types.has(type_slug)) {
        if (show_warning) {
          console.log("WARNING, store,entrytype.getters.entry_type: type for slug missing", type_slug, "returning null, should be catched earlier")
        }
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
  has_template_in_lang(state, getters) {
    return (slug, language) => {
      return getters.entry_type(slug, language, false, false) !== null
    }
  },
  has_code(state, getters) {
    return (type_slug, language) => getters.code(type_slug, language) !== null
  },
  code(state) {
    return (slug, language) => {
      // console.log("getting entry_type for slug", type_slug, state.entry_types)
      if (!state.codes.has(slug)) {
        console.log("WARNING, store,entrytype.getters.entry_type. type for slug missing:", slug, "returning null, should be catched earlier")
        return null
      }
      const base_template = state.codes.get(slug)
      // console.log("code",slug, Object.keys(base_template.lang))
      if (base_template.lang.hasOwnProperty(language)) {
        // console.log("->", language)
        return base_template.lang[language]
      } else {
        return base_template.lang[Object.keys(base_template.lang)[0]]
      }
    }
  },
  get_code_in_lang(state, getters, rootState, rootGetters) {
    return (slug, language, fallback = true, show_warning = true) => {
      // console.log("getting entry_type for slug", type_slug, state.entry_types)
      const base = state.codes.get(slug)
      if (!base) {
        if (show_warning) {
          console.log("WARNING, store,templates.get_code_in_lang: code-base for slug missing", slug, "returning null, should be catched earlier")
        }
        return null
      }
      const code = ld.get(base, `lang.${language}`, null)
      if (code) {
        return code
      } else if (fallback) {
        const default_language = rootGetters["domain/get_domain_default_language"](base.domain)
        const code = base.lang[default_language]
        if (code)
          return code
        else if (show_warning) {
          console.log("WARNING, store,templates.get_code_in_lang: code for slug missing for fallback lang", slug, default_language, "returning null, should be catched earlier")
          return null
        }
      } else {
        return null
      }
    }
  },
  has_code_in_lang(state, getters) {
    return (slug, language) => {
      return getters.get_code_in_lang(slug, language, false, false)
    }
  },
  has_slug_in_lang(state, getters) {
    return (slug, language) => {
      return getters.has_template_in_lang(slug, language) || getters.has_code_in_lang(slug, language)
    }
  },
  codes_in_language(state, getters) {
    return language => {
      return Array.from(state.codes.values()).map(c => getters.code(c.slug, language))
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
      return Array.from(state.entry_types.values()).map(d => getters.entry_type(d.slug, language, fallback)).filter(e => e != null)
    }
  },
  tags_of_code(state) {
    return (code_slug, language, tag_values) => {
      // console.log(code_slug, language, tag_values)

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
            // console.log("templates/tags_of_code: no tag for slug, value, language", code_slug, v, language)
            // console.log("options", entry_tags[v].keys(), "->", entry_tags[v].values().next().value)
            return entry_tags[v].values().next().value.text
          }
        }
      })
    }
  },
  get_missing_domain_language(state) {
    return entries => {
      const missing = []
      entries.forEach(e => {
        let add = false
        const {domain, language} = e
        // console.log(domain,  language)
        // console.log(state.requested)
        // debugger
        if (!state.requested.hasOwnProperty(domain)) {
          add = true
        } else if (!state.requested[domain].has(language)) {
          add = true
        }
        console.log(add)
        if (add) {
          if (!missing.some(domain_lang =>
            domain_lang.domain === domain && domain_lang.language === language
          )) {
            missing.push({domain, language})
          }
        }
      })
      return missing
    }
  },
  get_missing_templates(state, getters) {
    return (entries, language) => {
      const slugs = Array.from(new Set(ld.map(entries, e => e.template.slug)))
      console.log("slugs", slugs)
      return slugs.filter(s => !getters.has_template_in_lang(s, language))
    }
  },
  templates_by_slugs(state, getters) {
    return (template_slugs, language) => {
      return template_slugs.map(t => getters.entry_type(t, language))
    }
  },
  entry_type_version(state) {
    return (type_slug, language, version) => {
      const base_template = state.entry_types.get(type_slug)
      debugger
      return base_template["prev_versions"].lang[`${language}-${version.toString()}`]
    }
  }
}

export const mutations = {
  insert_template_code(state, t_c) {
    // console.log("inserting templates-codes")
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
      // console.log("insert tag for: ", entry.slug, lang)
      for (let tag of tags) {
        if (!insert_to[tag.value]) {
          insert_to[tag.value] = new Map()
        }
        insert_to[tag.value].set(lang, {text: tag.text})
        if (tag.description) {
          insert_to[tag.value].get(lang).description = tag.description
        }
      }
    }
  },
  // add_to_requested(state, entries) {
  //   entries.forEach(e => {
  //     console.log("add requested", e.slug, e.domain,e.language)
  //     const {domain, language} = e
  //     if (!state.requested.hasOwnProperty(domain)) {
  //       state.requested[domain] = new Set([language])
  //     } else {
  //       state.requested[domain].add(language)
  //     }
  //   })
  // },
  set_from_storage(state, templates) {
    state.entry_types = new Map(templates.entry_types)
    state.codes = new Map(templates.codes)
    state.requested = templates.requested
    state.tags = templates.tags
  },
  add_template_of_version(state, template) {
    console.log("add_template_of_version...", template)
    const entry_type_base = state.entry_types.get(template.slug)
    console.log(`prev_versions.lang.${template.language}-${template.version.toString()}`)
    if (entry_type_base) {
      ld.set(entry_type_base, `prev_versions.lang.${template.language}-${template.version.toString()}`, template)
    }
  }
}

export const actions = {
  add_templates_codes({commit}, entries) {
    for (let t_c of entries) {
      commit("insert_template_code", t_c)
      if (t_c.type === "code") {
        commit("add_tags_from", t_c)
      }
    }
    console.log("adding...", entries)
    // commit("add_to_requested", entries)
  }
}
