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

    this.basic = new Basic(this)
    this.static = new Static(this)
    this.domain = new Domain(this)
    this.entry = new Entry(this)
    this.entries = new Entries(this)
    this.actor = new Actor(this)
    this.language = new Language(this)
  }

  is_initialized() {
    return this.axios !== null
  }

}

class QueryBase {

  constructor(api_wrapper, base_sub_path) {
    this.axios = api_wrapper.axios
    this.base = api_wrapper.api_baseURL + base_sub_path
  }

  get_(sub_path, config = {}) {
    return this.axios.get(`${this.base}/${sub_path}`, Object.assign(config, {
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    }))
  }

  post_(sub_path, data, config) {
    return this.axios.post(`${this.base}/${sub_path}`, data, config)
  }

  // _post(sub_path, data, config) {
  //   let promise = this.axios.post(`${this.base}/${sub_path}`, data, config)
  //   promise.then((res, rej) => {
  //     console.log("secret res", res)
  //   })
  //
  //   return promise
  // }

  patch_(sub_path, data, config) {
    return this.axios.patch(`${this.base}/${sub_path}`, data, config)
  }

  delete_(sub_path, data, config) {
    return this.axios.delete(`${this.base}/${sub_path}`, data, config)
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
    return this.get_("init_data", {
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      },
    })
  }
}

class Static extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, null)
    this.base = api_wrapper.axios_baseURL + "/static" // instead of /api/static
  }

  url(sub) {
    return `${this.base}/${sub}`
  }

  domain_banner(domain_name) {
    return `${this.base}/images/domains/${domain_name}/banner.jpg`
  }

  domain_icon(domain_name) {
    return `${this.base}/images/domains/${domain_name}/icon.png`
  }
}

class Domain extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/domain")
  }

  /**
   * all templates and codes of a domain
   */
  async basic_entries(domain_name) {
    return this.axios.get(`${domain_name}/basic_entries`)
  }

  async info(domain_name, language) {
    return this.get_(`${domain_name}/basic_entries`, {params: {language}})
  }

  async metainfo(domain_names) {
    return this.get_("metainfo", {
      params: {domain_names}
    })
  }

  async domain_content_as_index_table(domain_name, language) {
    return this.get_("domain_content_as_index_table", {
      params: {domain_name, language}
    })
  }

  async post_from_flat(domain_name, language, content) {
    content.push(["language", language])
    return this.post_(`${domain_name}/from_flat`, content)
  }

  async patch_from_flat(domain_name, language, content) {
    content.push(["language", language])
    return this.patch_(`${domain_name}/from_flat`, content)
  }

  async overview(language) {
    return this.get_("overview", {params: {language}})
  }
}

class Entry extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/entry")
  }

  exists(uuid) {
    return this.get_(`${uuid}/exists`)
  }

  get(uuid) {
    return this.get_(`${uuid}`)
  }

  // TODO why this slash?? otherwise it throws a 405 on the server!
  post(entry_data) {
    return this.post_(`${entry_data.uuid}`, entry_data)
  }

  patch(entry_data) {
    return this.patch_(`${entry_data.uuid}`, entry_data)
  }

  patch_accept(entry_data) {
    return this.patch_(`${entry_data.uuid}/accept`, entry_data)
  }

  patch_reject(entry_data) {
    return this.patch_(`${entry_data.uuid}/reject`, entry_data)
  }

  delete(uuid) {
    return this.delete_(`${uuid}`)
  }

  meta(uuid) {
    return this.get_(`${uuid}/meta`)
  }


  url_uuid_attachment(uuid, file_uuid) {
    return `${this.base}/${uuid}/attachment/${file_uuid}`
  }

  url_slug_attachment(slug, file_name) {
    return `${this.base}/${slug}/entry_file/${file_name}`
  }

  post_attachment(uuid, file_uuid, formData) {
    return this.post_(`${uuid}/attachment/${file_uuid}`,
      formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  delete_attachment(uuid, file_uuid) {
    return this.delete_(`${uuid}/attachment/${file_uuid}`)
  }

}

class Entries extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/entries")
  }

  async get_uuids(search_query) {
    return this.post_("get_uuids", search_query)
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
    return this.post_("by_uuids", data, {
      params: {
        limit,
        offset
      }
    })
  }

  async get_entries_by_slugs(slugs, language) {
    return this.get_("get_entries_by_slugs", {
      params: {slugs, language}, paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  }

  search(limit, offset, search_query) {
    return this.post_(`search`, search_query, {
      params: {
        limit,
        offset
      }
    })
  }

  map_entries(config = {}, as_geojson = false) {
    return this.post_(`map_entries`, config, {
      params: {
        as_geojson
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
    return this.post_("login", qs.stringify({
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
    return this.get_("validate_token", {
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
    return this.post_("me", profile_data)
  }

  change_email(data) {
    return this.post_("change_email", data)
  }

  change_password(passwords) {
    return this.post_("change_password", passwords)
  }

  post_profile_pic(formData) {
    return this.post_("profile_pic",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  logout() {
    return this.get_("logout")
  }

  /**
   *
   * @param data user_data
   * registered_name, email, password, password_confirm, settings
   * @returns {*} 200 or ...
   */
  post_actor(data) {
    return this.post_("", data)
  }

  resend_email_verification_mail(registered_name) {
    return this.get_("resend_email_verification_mail", {
      params: {
        registered_name
      }
    })
  }

  init_delete() {
    return this.get_("init_delete")
  }

  verify_email_address(registered_name, verification_code) {
    return this.get_("verify_email_address", {
      params: {
        registered_name,
        verification_code
      }
    })
  }

  delete_account(data) {
    return this.post_("delete", data)
  }

  search(search_query) {
    return this.post_("search", search_query)
  }

  basic(registerd_name) {
    return this.get_(`${registerd_name}/basic`)
  }

  init_password_reset(email_or_username) {
    return this.get_("init_password_reset", {
      params: {
        email_or_username
      }
    })
  }

  reset_password(data) {
    return this.post_("reset_password", data)
  }

  post_global_role(registered_name, data) {
    return this.post_(`${registered_name}/global_role`, data)
  }

  get_all(details = false) {
    return this.get_("get_all", {
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

  get_component(component, languages, structured = true) {
    return this.get_("get_component", {
      params: {
        component, languages, structured
      }, paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      }
    })
  }

  update_messages(component, language, data) {
    return this.post_("update_messages", data, {
      params: {
        component,
        language
      }
    })
  }

  search(search_query) {
    return this.get_("search", {
      params: {
        search_query
      }
    })
  }

  add_language(language_code) {
    return this.post_("add_language", null, {params: {language_code}})
  }

  all_added_languages() {
    return this.get_("all_added_languages")
  }

  get_language_names(lang_code) {
    return this.get_("get_language_names", {
      params: {lang_code}
    })
  }
}


Vue.prototype.$api = new APIWrapper()
