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
    this.domain_baseURL = this.api_baseURL + "/domain"
    this.entry_baseURL = this.api_baseURL + "/entry"
    this.entries_baseURL = this.api_baseURL + "/entries"
    this.static_baseURL = this.axios_baseURL + "/static"

    this.basic = new Basic(this)
    this.entry = new Entry(this)
    this.entries = new Entries(this)
    this.actor = new Actor(this)
    this.language = new Language(this)
  }

  is_initialized() {
    return this.axios !== null
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

  get_static_url(sub) {
    return `${this.static_baseURL}/${sub}`
  }

  static_url_$domain_name_banner(domain_name) {
    return `${this.static_baseURL}/images/domains/${domain_name}/banner.jpg`
  }

  static_url_$domain_name_icon(domain_name) {
    return `${this.static_baseURL}/images/domains/${domain_name}/icon.png`
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

  entries_map_entries(config = {}, as_geojson = false) {
    return this.axios.post(`${this.entries_baseURL}/map_entries`, config, {
      params: {
        as_geojson
      }
    })
  }

}

class QueryBase {

  constructor(api_wrapper, base_sub_path) {
    this.axios = api_wrapper.axios
    this.base = api_wrapper.api_baseURL + base_sub_path
  }

  get(sub_path, config) {
    return this.axios.get(`${this.base}/${sub_path}`, config)
  }

  post(sub_path, data, config) {
    return this.axios.post(`${this.base}/${sub_path}`, data, config)
  }
}

class Basic extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/basic")
  }

    init_data(domains, language) {
    // console.log("requesting language", language)
    const params = {}
    if (domains) {
      params.domains = domains
    }
    if (language) {
      params.language = language
    }
    return this.get("init_data", {params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      },
    })
  }
}

class Entry extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/entry")
  }

  async exists(uuid) {
    return this.get(`${uuid}/exists`)
  }
}

class Entries extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/entries")
  }

  async get_uuids(search_query) {
    return this.post("get_uuids", search_query)
  }

  async by_uuids(uuids, fields, limit = 40, offset = 0) {
    const data = {
      uuid_list: {
        uuids: uuids
      }
    }
    if (fields) {
      body.fields = fields
    }
    return this.post("by_uuids", data, {
      params: {
        limit,
        offset
      }
    })
  }
}

class Actor extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/actor")
  }

  /**
   * login
   */
  login({user_query, password}) {
    return this.post("login", qs.stringify({
      username: user_query, // actually both username or email, but the given class on the backend calls it username
      password,
      grant_type: "password",
      swagger_compatible_fields: false
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

  validate_token(auth_token) {
    return this.get("validate_token", {
      headers: {
        "Authorization": auth_token.token_type + " " + auth_token.access_token
      }
    })
  }

  /**
   * update the user profile or settings
   * @param profile_data
   */
  post_me(profile_data) {
    return this.post("me", profile_data)
  }

  change_email(data) {
    return this.post("change_email", data)
  }

  change_password(passwords) {
    return this.post("change_password", passwords)
  }

  post_profile_pic(formData) {
    return this.post("profile_pic",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  logout() {
    return this.get("logout")
  }

  /**
   *
   * @param data user_data
   * registered_name, email, password, password_confirm, settings
   * @returns {*} 200 or ...
   */
  post_actor(data) {
    return this.post("", data)
  }

  resend_email_verification_mail(registered_name) {
    return this.get("resend_email_verification_mail", {
      params: {
        registered_name
      }
    })
  }

  init_delete() {
    return this.get("init_delete")
  }

  verify_email_address(registered_name, verification_code) {
    return this.get("verify_email_address", {
      params: {
        registered_name,
        verification_code
      }
    })
  }

  delete_account(data) {
    return this.post("delete", data)
  }

  search(search_query) {
    return this.post("search", search_query)
  }

  basic(registerd_name) {
    return this.get(`${registerd_name}/basic`)
  }

  init_password_reset(email_or_username) {
    return this.get("init_password_reset", {
      params: {
        email_or_username
      }
    })
  }

  reset_password(data) {
    return this.post("reset_password", data)
  }

  post_global_role(registered_name, data) {
    return this.post(`${registered_name}/global_role`, data)
  }

  get_all(details = false) {
    return this.get("get_all", {
      params: {
        details
      }
    })
  }

  url_avatar(registered_name) {
    return `${this.base}/${registered_name}/avatar`
  }

  url_profile_pic(registered_name) {
    return `${this.base}/${registered_name}/profile_pic`
  }

}

class Language extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/language")
  }

  get_component(component, language) {
    return this.get("get_component", {
      params: {
        component, language
      }
    })
  }

}

// console.log(Nuxt)
Vue.prototype.$api = new APIWrapper()
