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
  act_lang_domain_data: null
})

export const mutations = {
  add_domains_overviews(state, domain_overviews) {
    for (let domain_o of domain_overviews) {
      let {title, description, ...main_domain_data} = domain_o
      if (!state.domains.has(domain_o.name)) {
        state.domains.set(domain_o.name, Object.assign(main_domain_data, {overviews: {}, langs: {}}))
      }
      state.domains.get(domain_o.name).overviews[domain_o.language] = {
        title,
        description
      }
    }
  },
  set_act_domain(state, domain_name) {
    // todo could use a validator. check if the names exists in all domains
    state.act_domain_name = domain_name
  },
  set_act_lang_domain_data(state, {domain_name, language}) {
    const domain_base = state.domains.get(domain_name)
    if (domain_base) {
      let domain_data = domain_base.langs[language]
      if (domain_data) {
        state.act_lang_domain_data = domain_data
      } else {
        console.log("Cannot set domain language to language that does not exist. catch before!")
      }
    }
  },
  add_domains_data(state, domains_data) {
    if (state.domains.size === 0) {
      domains_data = domains_data.map(d => ({
        name: d.name,
        langs: {[d.language]: Object.assign(d.content, {title: d.title, name: d.name})},
        languages: d.languages,
        default_language: d.default_language,
        overviews: {}
      }))
      state.domains = new Map(ld.toPairs(ld.keyBy(domains_data, d => d.name)))
      // console.log(state.domains)
    } else {
      // console.log("inserting new language")
      for (let d of domains_data) {
        Object.assign(d.content, {title: d.title, name: d.name})
        state.domains.get(d.name).langs[d.language] = d.content
      }
    }
  }
}

export const actions = {
  clear_domain({commit}, language) {
    commit("set_act_domain", NO_DOMAIN)
    commit("set_act_lang_domain_data", {domain_name:NO_DOMAIN, language})
  },
  set_act_domain_lang({commit}, {domain_name, language}) {
    commit("set_act_domain", domain_name)
    commit("set_act_lang_domain_data", {domain_name, language})
  },
  set_domains({commit}, {domains_data, language}) {
    console.log(domains_data)
    commit("add_domains_data", domains_data)
    commit("add_domains_overviews", domains_data.map(d => (
      {
        name: d.name,
        language: language,
        title: d.title,
        description: d.content.description
      }
    )))
  }
}

export const getters = {
  domains(state) {
    return () => Array.from(state.domains.values())
  },
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
      return getters.lang_domain_data(domain_name, language) !== undefined
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
  }
};
