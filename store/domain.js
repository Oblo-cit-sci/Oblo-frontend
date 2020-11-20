import {NO_DOMAIN} from "~/lib/consts"

const ld = require("lodash")

export const state = () => ({
  /**
   * index sorted, names as key
   * value: name, languages, index
   * lang -> where language-contents go in
   * lang.en = ...
   */
  domains: new Map(),
  act_domain_name: NO_DOMAIN
})

export const mutations = {
  set_domains(state, {domains_data, language}) {
    if (state.domains.size === 0) {
      state.domains = new Map(ld.toPairs(ld.keyBy(domains_data, d => d.name)))
      for(let d of state.domains.values()) {
        Object.assign(d.content, {title: d.title, name: d.name})
        d.langs = {[d.language]: d.content}
      }
      console.log(state.domains)
    } else {
      // todo this only works, since all domains are always sent along
      for (let domain_index in domains_data) {
        state.domains[domain_index][language] = domains_data[domain_index][language]
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
  // delete_domain(state, domain_name) {
  //   state.domains = ld.filter(state.domains, domain => domain.value !== domain_name)
  // }
};

export const getters = {
  domains(state) {
    return Array.from(state.domains.values())
  },
  // todo act_domain_name
  act_domain_name(state) {
    return state.act_domain_name
  },
  // todo act_domain_data
  act_domain_data(state, getters) {
    return getters.domains.find(d => d.name === state.act_domain_name)
  },
  // todo act_domain_title, REMOVE, language
  act_domain_title(state, getters) {
    return getters.act_lang_domain_data.title
  },
  act_lang_domain_data(state, getters, rootGetters) {
    return getters.lang_domain_data(state.act_domain_name, rootGetters.user.settings.ui_language)
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
  // todo just used once atm. maybe not required as store getter
  domains_for_lang(state) {
    return (lang_code, keep_no_domain = false) => {
      return ld.map(ld.filter(state.domains,
        d => d.hasOwnProperty(lang_code) && d.name !== NO_DOMAIN),
        d => (d[lang_code]))
    }
  },
  // domain_options(state) {
  //   return () => {
  //     return object_list2options(state.domains, TITLE)
  //   }
  // },
};
