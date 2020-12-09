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
  set_domains(state, {domains_data, language}) {
    if (state.domains.size === 0) {
      domains_data = domains_data.map(d => ({
        name: d.name,
        langs: {[d.language]: Object.assign(d.content, {title: d.title, name: d.name})},
        languages: d.languages
      }))
      state.domains = new Map(ld.toPairs(ld.keyBy(domains_data, d => d.name)))
      // console.log(state.domains)
    } else {
      console.log("inserting new language")
      for (let d of domains_data) {
        Object.assign(d.content, {title: d.title, name: d.name})
        state.domains.get(d.name).langs[d.language] = d.content
      }
    }
  },
  set_act_domain(state, domain_name) {
    // todo could use a validator. check if the names exists in all domains
    state.act_domain_name = domain_name
  },
  clear_domain(state) {
    state.act_domain_name = NO_DOMAIN
  },
  set_act_lang_domain_data(state, {domain_name, language}) {
    const domain_base = state.domains.get(domain_name)
    if (domain_base) {
      let domain_data = domain_base.langs[language]
      if (domain_data) {
        state.act_lang_domain_data = domain_data
      } else {
        state.act_lang_domain_data = this.$_.values(domain_base.langs)[0]
      }
    }
  }
};

export const getters = {
  domains(state) {
    return Array.from(state.domains.values())
  },
  act_domain_name(state) {
    return state.act_domain_name
  },
  act_domain_data(state, getters) {
    return getters.domains.find(d => d.name === state.act_domain_name)
  },
  // todo act_domain_title, REMOVE, language
  act_domain_title(state, getters) {
    return getters.act_lang_domain_data.title
  },
  act_lang_domain_data(state) {
    return state.act_lang_domain_data
  },
  domain_by_name(state) {
    return domain_name => {
      return state.domains.get(domain_name)
    }
  },
  lang_domain_data(state, getters) {
    return (domain_name, language) => {
      return getters.domain_by_name(domain_name).langs[language]
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
      return ld.filter(ld.map(getters.domains,  d => getters.lang_domain_data(d.name, lang_code)),
      d => d && (keep_no_domain || d.name !== "no_domain"))
    }
  },
  get_domain_languages(state, getters) {
    return (domain_name) => {
      return getters.domain_by_name(domain_name).languages
    }
  }
  // domain_options(state) {
  //   return () => {
  //     return object_list2options(state.domains, TITLE)
  //   }
  // },
};
