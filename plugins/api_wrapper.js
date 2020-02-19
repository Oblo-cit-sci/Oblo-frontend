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

  /**
   * registration
   */
  post_actor(data) {
    return this.axios.post(`${this.api_baseURL}/actor`, data)
  }

  /**
   * login
   */
  post_actor__login(username, password) {
    return this.axios.post(`${this.api_baseURL}/actor/login`, qs.stringify({
      username,
      password,
      grant_type: "password"
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

  /**
   * basic information of all domains
   * @returns {*} promise
   */
  domain() {
    return this.axios.get(`${this.api_baseURL}/domain`)
  }

  /**
   * all templates and codes of a domain
   */
  domain__$domain_name__basic_entries(domain_name) {
    return this.axios.get(`${this.api_baseURL}/domain/${domain_name}/basic_entries`)
  }

  /**
   * regular entries of a domain, paginated
   */
  domain__$domain_name__entries(domain_name, limit, offset) {
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
        "Authorization": auth_token.token_type + " " + auth_token.access_token
      }
    })
  }

  url_actor__$registered_name__avatar(registered_name) {
    return `${this.api_baseURL}/actor/${registered_name}/avatar`
  }

  post_actor__me(profile_data) {
    return this.axios.post(`${this.api_baseURL}/actor/me`, profile_data)
  }

  post_actor__avatar(formData) {
    return this.axios.post(`${this.api_baseURL}/actor/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  post_actor__form_test(formData) {
    return this.axios.post(`${this.api_baseURL}/actor/form_test`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  actor__logout() {
    return this.axios.get(`${this.api_baseURL}/actor/logout`)
  }

  entry__$uuid(uuid) {
    return this.axios.get(`${this.api_baseURL}/entry/${uuid}`)
  }

  post_entry(entry_data) {
    return this.axios.post(`${this.api_baseURL}/entry`, entry_data)
  }

  post_entry__$uuid(uuid, entry_data) {
    return this.axios.post(`${this.api_baseURL}/entry/${uuid}`, entry_data)
  }

  delete_entry__$uuid(uuid) {
    return this.axios.delete(`${this.api_baseURL}/entry/${uuid}`)
  }
}


// console.log(Nuxt)
Vue.prototype.$api = new APIWrapper()
