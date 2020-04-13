import Vue from 'vue'

const qs = require('qs');

class APIWrapper {

  constructor() {
    this.axios = null
  }

  init(axios, baseURL = null) {
    this.axios = axios
    if (baseURL)
      this.axios_baseURL = baseURL
    else
      this.axios_baseURL = axios.defaults.baseURL
    this.api_baseURL = this.axios_baseURL + "/api"
    //
    this.basic_baseURL = this.api_baseURL + "/basic"
    this.domain_baseURL = this.api_baseURL + "/domain"
    this.actor_baseURL = this.api_baseURL + "/actor"
    this.entry_baseURL = this.api_baseURL + "/entry"
    this.entries_baseURL = this.api_baseURL + "/entries"
    this.static_baseURL = this.axios_baseURL + "/static"
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
    return this.axios.post(`${this.actor_baseURL}/`, data)
  }

  delete_account(data) {
    return this.axios.post(`${this.actor_baseURL}/delete`, data)
  }

  /**
   * login
   */
  post_actor__login(username, password) {
    return this.axios.post(`${this.actor_baseURL}/login`, qs.stringify({
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

  init_data() {
    return this.axios.get(`${this.basic_baseURL}/init_data`)
  }

  verify_email_address(registered_name, verification_code) {
    return this.axios.get(`${this.actor_baseURL}/verify_email_address`, {
      params: {
        registered_name,
        verification_code
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
  async domain__$domain_name__basic_entries(domain_name) {
    return this.axios.get(`${this.domain_baseURL}/${domain_name}/basic_entries`)
  }


  actor__validate_token(auth_token) {
    return this.axios.get(`${this.actor_baseURL}/validate_token`, {
      headers: {
        "Authorization": auth_token.token_type + " " + auth_token.access_token
      }
    })
  }

  url_actor__$registered_name__avatar(registered_name) {
    return `${this.actor_baseURL}/${registered_name}/avatar`
  }

  url_actor__$registered_name__profile_pic(registered_name) {
    return `${this.actor_baseURL}/${registered_name}/profile_pic`
  }

  static_url_$domain_name_banner(domain_name) {
    return `${this.static_baseURL}/images/domains/${domain_name}/banner.jpg`
  }

  static_url_$domain_name_icon(domain_name) {
    return `${this.static_baseURL}/images/domains/${domain_name}/icon.png`
  }

  post_actor__me(profile_data) {
    return this.axios.post(`${this.actor_baseURL}/me`, profile_data)
  }

  post_actor__change_password(passwords) {
    return this.axios.post(`${this.actor_baseURL}/change_password`, passwords)
  }

  post_actor__avatar(formData) {
    return this.axios.post(`${this.actor_baseURL}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  post_profile_pic(formData) {
    return this.axios.post(`${this.actor_baseURL}/profile_pic`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  actor__logout() {
    return this.axios.get(`${this.actor_baseURL}/logout`)
  }

  async entry__$uuid(uuid) {
    return this.axios.get(`${this.entry_baseURL}/${uuid}`)
  }

  post_entry__$uuid(entry_data) {
    return this.axios.post(`${this.entry_baseURL}/${entry_data.uuid}`, entry_data)
  }

  patch_entry__$uuid(entry_data) {
    return this.axios.patch(`${this.entry_baseURL}/${entry_data.uuid}`, entry_data)
  }

  patch_entry__$uuid_accept(entry_data) {
    return this.axios.patch(`${this.entry_baseURL}/${entry_data.uuid}/accept`, entry_data)
  }

  patch_entry__$uuid_reject(entry_data) {
    return this.axios.patch(`${this.entry_baseURL}/${entry_data.uuid}/reject`, entry_data)
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

  delete_entry__$uuid__attachment__$file_uuid(uuid, file_uuid) {
    return this.axios.delete(`${this.entry_baseURL}/${uuid}/attachment/${file_uuid}`)
  }


  entries_search(limit, offset, search_query) {
    return this.axios.post(`${this.entries_baseURL}/search`, search_query, {
      params: {
        limit,
        offset
      }
    })
  }

  actor_search(search_query) {
    return this.axios.post(`${this.actor_baseURL}/search`, search_query)
  }

  actor_clear_cache() {
    return this.axios.get(`${this.actor_baseURL}/clear_cache`)
  }

  entries_map_entries() {
    return this.axios.post(`${this.entries_baseURL}/map_entries`)
  }

  actor__$registered_name__basic(registerd_name) {
    return this.axios.get(`${this.actor_baseURL}/${registerd_name}/basic`)
  }

  actor__init_password_reset(email_or_username) {
    return this.axios.get(`${this.actor_baseURL}/init_password_reset`, {
      params: {
        email_or_username
      }
    })
  }

  post_actor__reset_password(data) {
    return this.axios.post(`${this.actor_baseURL}/reset_password`, data)
  }
}


// console.log(Nuxt)
Vue.prototype.$api = new APIWrapper()
