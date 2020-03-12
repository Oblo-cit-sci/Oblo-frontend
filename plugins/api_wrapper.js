import Vue from 'vue'

const qs = require('qs');

class APIWrapper {

  constructor() {
    this.axios = null
  }

  init(axios) {
    this.axios = axios
    this.axios_baseURL = axios.defaults.baseURL
    this.api_baseURL = this.axios_baseURL + "/api"
    //
    this.domain_baseURL = this.api_baseURL + "/domain"
    this.actor_baseURL = this.api_baseURL + "/actor/"
    this.entry_baseURL = this.api_baseURL + "/entry"
    this.entries_baseURL = this.api_baseURL + "/entries/"
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
    return this.axios.post(this.actor_baseURL, data)
  }

  /**
   * login
   */
  post_actor__login(username, password) {
    return this.axios.post(`${this.actor_baseURL}login`, qs.stringify({
      username,
      password,
      grant_type: "password",
      swagger_compatible_fields: false
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
    return this.axios.get(`${this.domain_baseURL}/`)
  }

  /**
   * all templates and codes of a domain
   */
  domain__$domain_name__basic_entries(domain_name) {
    return this.axios.get(`${this.domain_baseURL}/${domain_name}/basic_entries`)
  }

  /**
   * regular entries of a domain, paginated
   */
  domain__$domain_name__entries(domain_name, limit, offset, search_query) {
    return this.axios.post(`${this.domain_baseURL}/${domain_name}/entries`, search_query, {
      params: {
        limit,
        offset
      }
    })
  }

  actor__validate_token(auth_token) {
    return this.axios.get(`${this.actor_baseURL}validate_token`, {
      headers: {
        "Authorization": auth_token.token_type + " " + auth_token.access_token
      }
    })
  }

  url_actor__$registered_name__avatar(registered_name) {
    return `${this.actor_baseURL}${registered_name}/avatar`
  }

  post_actor__me(profile_data) {
    return this.axios.post(`${this.actor_baseURL}me`, profile_data)
  }

  post_actor__avatar(formData) {
    return this.axios.post(`${this.actor_baseURL}avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  post_actor__form_test(formData) {
    return this.axios.post(`${this.actor_baseURL}form_test`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  actor__logout() {
    return this.axios.get(`${this.actor_baseURL}logout`)
  }

  entry__$uuid(uuid) {
    return this.axios.get(`${this.entry_baseURL}/${uuid}`)
  }

  post_entry__$uuid(uuid, entry_data) {
    return this.axios.post(`${this.entry_baseURL}/${uuid}`, entry_data)
  }

  patch_entry__$uuid(uuid, entry_data) {
    return this.axios.patch(`${this.entry_baseURL}/${uuid}`, entry_data)
  }

  delete_entry__$uuid(uuid) {
    return this.axios.delete(`${this.entry_baseURL}/${uuid}`)
  }

  post_entry__$uuid__attachment__$file_uuid(uuid, file_uuid, formData) {
    return this.axios.post(`${this.entry_baseURL}/${uuid}/attachment/${file_uuid}`,
      formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  url_entry__$uuid__attachment__$file_uuid(uuid, file_uuid) {
    return `${this.entry_baseURL}/${uuid}/attachment/${file_uuid}`
  }

  entries_search(limit, offset, search_query) {
    return this.axios.post(`${this.entries_baseURL}search`, search_query, {
      params: {
        limit,
        offset
      }
    })
  }

  actor_search(search_query) {
    return this.axios.post(`${this.actor_baseURL}search`, search_query)
  }
}


// console.log(Nuxt)
Vue.prototype.$api = new APIWrapper()
