import {NO_DOMAIN} from "~/lib/consts"

const ld = require("lodash")

export const state = () => ({
  /**
   * index sorted, names as key
   * value: name, languages, langs
   * lang -> where language-contents go in
   * lang.en = ...
   */
  domains: new Map(),
  act_domain_name: NO_DOMAIN,
  act_lang_domain_data: null,
  requested_overview_languages: new Set()
})

function domainmeta_and_store_init_struct(domain_data) {
  const {name, index, languages, default_language} = domain_data
  return {name, index, languages, default_language, langs: {}, overviews: {}}
}

export const mutations = {
  guarantee_domains_and_sort(state, domains_data) {
    let new_domain_added = false
    const all_domains_data = Array.from(state.domains.values())
    for (const d of domains_data) {
      if (!state.domains.has(d.name)) {
        all_domains_data.push(domainmeta_and_store_init_struct(d))
        new_domain_added = true
      }
    }
    if (new_domain_added) {
      all_domains_data.sort((d1, d2) => d1.index - d2.index)
      state.domains = new Map(ld.toPairs(ld.keyBy(all_domains_data, d => d.name)))
    }
  },
  add_domains_data(state, domains_data) {
    for (let domain of domains_data) {
      const domain_name = domain.name
      if (!state.domains.has(domain_name)) {
        state.domains.set(domain_name, domain)
      } else {
        const domain_langs = state.domains.get(domain_name).langs
        state.domains.get(domain_name).langs = Object.assign(domain_langs, domain.langs)
        const domain_overviews = state.domains.get(domain_name).overviews
        state.domains.get(domain_name).overviews = Object.assign(domain_overviews, domain.overviews)
      }
    }
  },
  set_act_domain(state, domain_name) {
    // todo could use a validator. check if the names exists in all domains
    state.act_domain_name = domain_name
  },
  set_act_lang_domain_data(state, {domain_name, language}) {
    // console.trace()
    // console.log(domain_name, language)
    const domain_base = state.domains.get(domain_name)
    // console.log(domain_base)
    if (domain_base) {
      let domain_data = domain_base.langs[language]
      if (domain_data) {
        state.act_lang_domain_data = domain_data
      } else {
        console.log(`Cannot set domain language (${domain_name}) to ${language} that does not exist. catch before!`)
      }
    }
  },
  // for offline mode
  set_from_storage(state, domains) {
    state.domains = new Map(domains)
  },
  add_overview_language(state, language) {
    state.requested_overview_languages.add(language)
  }
}

export const actions = {
  clear_domain({commit, getters}, language) {
    commit("set_act_domain", NO_DOMAIN)
    if (!getters.has_lang_domain_data(NO_DOMAIN, language))
      language = getters.get_domain_default_language(NO_DOMAIN)
    commit("set_act_lang_domain_data", {domain_name: NO_DOMAIN, language})
  },
  set_act_domain_lang({commit, getters}, {domain_name, language}) {
    const has_domain_lang = getters.has_lang_domain_data(domain_name, language)
    // console.log("set_act_domain_lang")
    if (has_domain_lang) {
      // console.log("SETTING DOMAIN LANG", domain_name, language)
      commit("set_act_lang_domain_data", {domain_name, language})
      commit("set_act_domain", domain_name)
      return
    }
    if (domain_name !== getters.act_domain_name) {
      language = getters.get_domain_default_language(domain_name)
      commit("set_act_lang_domain_data", {domain_name, language})
      commit("set_act_domain", domain_name)
    }
  },
  // set_domains({state, commit}, domains_data) {
  //   commit("add_domains_data", domains_data)
  // }
}

export const getters = {
  domains(state) {
    return () => Array.from(state.domains.values())
  },
  // domain_overviews(state) {
  //   return (language) => {
  //     const result = {}
  //     Array.from(state.domains.entries()).forEach(name_data =>
  //       result[name_data[0]] = name_data[1].overviews[language] || {})
  //     return result
  //   }
  // },
  all_domains_names(state, getters) {
    return (include_no_domain = false) => {
      const all_domains = getters.domains().map(d => d.name)
      if (include_no_domain) {
        return all_domains
      } else
        return all_domains.filter(l => l !== NO_DOMAIN)
    }
  },
  act_domain_name(state) {
    return state.act_domain_name
  },
  act_domain_data(state, getters) {
    return getters.domains().find(d => d.name === state.act_domain_name)
  },
  // todo act_domain_title, REMOVE, language
  act_domain_title(state, getters) {
    return getters.act_lang_domain_data.title
  },
  act_lang_domain_data(state) {
    return state.act_lang_domain_data
  },
  cur_act_lang_domain_data(state) {
    return () => state.act_lang_domain_data
  },
  domain_by_name(state) {
    return domain_name => {
      return state.domains.get(domain_name)
    }
  },
  lang_domain_data(state, getters) {
    return (domain_name, language, with_default = true) => {
      // console.log(domain_name, getters.get_domain_languages(domain_name),getters.get_domain_default_language(domain_name))
      // console.log(getters.get_domain_languages(domain_name).includes(language))
      if (getters.get_domain_languages(domain_name).includes(language) || !with_default)
        return getters.domain_by_name(domain_name).langs[language]
      else
        return getters.domain_by_name(domain_name).langs[getters.get_domain_default_language(domain_name)]
    }
  },
  domain_overview(state, getters) {
    return (domain_name, language, with_default = true) => {
      // console.log(domain_name, getters.get_domain_languages(domain_name),getters.get_domain_default_language(domain_name))
      // console.log(getters.get_domain_languages(domain_name).includes(language))
      if (getters.get_domain_languages(domain_name).includes(language) || !with_default)
        return Object.assign({name: domain_name},
          getters.domain_by_name(domain_name).overviews[language])
      else
        return Object.assign({name: domain_name},
          getters.domain_by_name(domain_name).overviews[getters.get_domain_default_language(domain_name)])
    }
  },
  all_domains_overview(state, getters) {
    /***
     * nice
     */
    return (language, include_no_domain = false, fallback_default = true) => {
      return getters.all_domains_names(include_no_domain).map(d => getters.domain_overview(d, language, fallback_default))
    }
  },
  has_lang_domain_data(state, getters) {
    return (domain_name, language) => {
      return getters.lang_domain_data(domain_name, language, false) !== undefined
    }
  },
  // todo just used once atm. maybe not required as store getter
  domains_for_lang(state, getters) {
    return (lang_code, keep_no_domain = false) => {
      return ld.filter(ld.map(getters.domains(), d => getters.lang_domain_data(d.name, lang_code)),
        d => d && (keep_no_domain || d.name !== "no_domain"))
    }
  },
  get_domain_languages(state, getters) {
    return (domain_name) => {
      return getters.domain_by_name(domain_name).languages
    }
  },
  get_domain_default_language(state, getters) {
    return (domain_name) => {
      return getters.domain_by_name(domain_name).default_language
    }
  },
  get_domain_default_lang_data(state, getters) {
    return (domain_name) => {
      return getters.lang_domain_data(domain_name, getters.get_domain_default_language(domain_name))
    }
  },
  get_any_lang_data(state, getters) {
    return (domain_name) => {
      // console.log("get_any_lang_data" ,)
      // getters.lang_domain_data(domain_name, getters.get_domain_languages(domain_name)[0])
      return Object.values(getters.domains().find(d => d.name === domain_name).langs)[0]
    }
  },
  is_concrete_domain(state) {
    return state.act_domain_name !== NO_DOMAIN
  },
  get_requested_overviews(state) {
    return () => state.requested_overview_languages
  }
};
