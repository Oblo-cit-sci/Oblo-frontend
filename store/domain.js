import {NO_DOMAIN, TITLE} from "~/lib/consts"

const ld = require("lodash")

export const state = () => ({
  domains: [],
  domain: NO_DOMAIN
})

export const mutations = {
  set_domains(state, {domains_data, language}) {
    if (state.domains.length === 0) {
      state.domains = domains_data
    } else {
      // todo this only works, since all domains are always sent along
      for (let domain_index in domains_data) {
        state.domains[domain_index][language] = domains_data[domain_index][language]
      }
    }
  },
  set_act_domain(state, domain_name) {
    state.domain = domain_name
  },
  clear_domain(state) {
    state.domain = NO_DOMAIN
  },
  // delete_domain(state, domain_name) {
  //   state.domains = ld.filter(state.domains, domain => domain.value !== domain_name)
  // }
};

export const getters = {
  domains(state) {
    return state.domains
  },
  // todo act_domain_name
  domain_name(state) {
    return state.domain
  },
  // todo act_domain_data
  domain(state, getters) {
    return getters.domains[state.domain]
  },
  // todo should be act_domain_data
  domain_data(state, getters) {
    return getters.domains[state.domain]
  },
  // todo act_domain_title, REMOVE, language
  domain_title(state, getters) {
    return getters.domain.title
  },
  domain_by_name(state) {
    return domain_name => {
      return state.domains.find(domain => domain.name === domain_name)
    }
  },
  lang_domain_data(state, getters) {
    return (domain_name, language) => {
      return getters.domain_by_name(domain_name)[language]
    }
  },
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
  // NEW
  act_lang_domain_data(state, getters, rootGetters) {
    return getters.lang_domain_data(state.domain, rootGetters.user.settings.ui_language)
  }
};
