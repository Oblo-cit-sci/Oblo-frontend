import Vue from 'vue'

const qs = require('qs');

class APIWrapper {

  constructor() {
    this.axios = null
    this.axios_baseURL = null
    this.api_baseURL = null
  }

  init(axios) {
    this.axios = axios
    this.axios_baseURL = axios.defaults.baseURL
    this.api_baseURL = this.axios_baseURL + "/api"
  }

  is_initialized() {
    return this.axios !== null

  }

  /*
  API ROUTES
   */

  post_actor(data) {
    /**
     * registration
     */
    return this.axios.post(`${this.api_baseURL}/actor`, data)
  }

  post_token(username, password) {
    /**
     * login
     */
    return this.axios.post(`${this.api_baseURL}/token`, qs.stringify({
      username,
      password,
      grant_type: "password"
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

  domain() {
    /**
     * basic information of all domains
     */
    return this.axios.get(`${this.api_baseURL}/domain`)
  }

  domain__$domain_name__basic_entries(domain_name) {
    /**
     * all templates and codes of a domain
     */
    return this.axios.get(`${this.api_baseURL}/domain/${domain_name}/basic_entries`)
  }

  domain__$domain_name__entries(domain_name, limit, offset) {
    /**
     * regular entries of a domain, paginated
     */
    return this.axios.get(`${this.api_baseURL}/domain/${domain_name}/entries`, {
      params: {
        limit,
        offset
      }
    })
  }

  actor__validate_token(auth_token) {
    return this.axios.get(`${this.api_baseURL}/actor/validate_token`, {
      headers: {
        "Authorization": auth_token.token_type  +" " + auth_token.access_token
      }
    })
  }

  url_actor__$registered_name__avatar(registered_name) {
    return `${this.api_baseURL}/actor/${registered_name}/avatar`
  }

  entry__$uuid(uuid) {
    return this.axios.get(`${this.api_baseURL}/entry/${uuid}`)
  }

  post_entry(entry_data) {
    return this.axios.post(`${this.api_baseURL}/entry`, entry_data)
  }
}


// console.log(Nuxt)
Vue.prototype.$api = new APIWrapper()
