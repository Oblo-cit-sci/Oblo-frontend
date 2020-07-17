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

    // todo THE NEW WAY, refactor all methods like this... :)
    this.entries = new Entries(this)
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
      username, // actually both username or email, but the given class on the backend calls it username
      password,
      grant_type: "password",
      swagger_compatible_fields: false
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

  actor__resend_email_verification_mail(registered_name) {
    return this.axios.get(`${this.actor_baseURL}/resend_email_verification_mail`, {
      params: {
        registered_name
      }
    })
  }

  actor__init_delete() {
    return this.axios.get(`${this.actor_baseURL}/init_delete`)
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

  get_static_url(sub) {
    return `${this.static_baseURL}/${sub}`
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

  entry__$uuid_meta(uuid) {
    return this.axios.get(`${this.entry_baseURL}/${uuid}/meta`)
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

  url_entry__$slug__entry_file__$file_name(slug, file_name) {
    return `${this.entry_baseURL}/${slug}/entry_file/${file_name}`
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

  entries_map_entries(config = {}, as_geojson = false) {
    return this.axios.post(`${this.entries_baseURL}/map_entries`, config, {
      params: {
        as_geojson
      }
    })
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

  post_actor__$registered_name__global_role(registered_name, role, domain) {
    return this.axios.post(`${this.actor_baseURL}/${registered_name}/global_role`, {}, {
      params: {
        role,
        domain
      }
    })
  }

  actor__get_all(details = false) {
    return this.axios.get(`${this.actor_baseURL}/get_all`, {
      params: {
        details
      }
    })
  }
}

class QueryBase {

  constructor(api_wrapper, base_sub_path) {
    this.axios = api_wrapper.axios
    this.base = api_wrapper.api_baseURL + base_sub_path
  }

  post(sub_path, body, params) {
    return this.axios.post(`${this.base}/${sub_path}`, body, params)
  }
}

class Entries extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/entries")
  }

  async get_uuids(search_query) {
    return this.post("get_uuids", search_query)
  }

  async by_uuids(uuids, fields, limit, offset) {
    const body = {
      uuid_list: {
        uuids: uuids
      }
    }
    if (fields) {
      body.fields = fields
    }
    return this.post("by_uuids", body, {
      params: {
        limit,
        offset
      }
    })
  }
}

// console.log(Nuxt)
Vue.prototype.$api = new APIWrapper()
