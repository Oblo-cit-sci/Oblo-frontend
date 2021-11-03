import Vue from "vue"

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
    this.oauth = new OAuth(this)
    this.static = new Static(this)
    this.domain = new Domain(this)
    this.entry = new Entry(this)
    this.entries = new Entries(this)
    this.actor = new Actor(this)
    this.language = new Language(this)
    this.util = new Util(this)
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

  url_(sub_path) {
    return `${this.base}/${sub_path}`
  }
}

class Basic extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/basic")
  }

  // overview(language) {
  //   console.log("init_data:requesting language", language)
  //   return this.get_("init_data", {
  //     params: {language}
  //   })
  // }

  init_data(language) {
    console.log("init_data:requesting language", language)
    // console.trace()
    const params = {}
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

  domain_basics(domains, language) {
    console.log("domain_basics:requesting language", language)
    // console.trace()
    const params = {}
    if (domains) {
      params.domains = domains
    }
    if (language) {
      params.language = language
    }
    return this.get_("domain_basics", {
      params,
      paramsSerializer: function (params) {
        return qs.stringify(params, {arrayFormat: 'repeat'})
      },
    })
  }

  // oauth_services() {
  //   return this.get_("oauth_services")
  // }

  // init_oauth(service) {
  //   return this.get_("init_oauth", {
  //     params: {service}
  //   })
  // }

  oauth_complete(data) {
    return this.get_("oauth_complete", {
      params: data
    })
  }

}


class OAuth extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/oauth")
  }

  url_init_oauth(service) {
    return `${this.url_("init_oauth")}?service=${service}`
  }

  oauth_complete(data) {
    return this.get_("oauth_complete", {
      params: data
    })
  }

  oauth_register(data) {
    return this.post_("oauth_register", data)
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


  async meta_info(domain_names) {
    return this.get_("meta_info", {
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

  async overviews(language) {
    return this.get_("overviews", {params: {language}})
  }

  async get_codes_templates(domain_name, language, full) {
    return this.get_(`${domain_name}/get_codes_templates`, {
      params: {language, full}
    })
  }

  async multi_d_get_codes_templates(domain_names, language, full) {
    return this.get_("get_codes_templates", {
      params: {domain_names, language, full}
    })
  }

  as_csv(domain_name, languages) {
    return this.get_(`${domain_name}/as_csv`, {
      params: {
        languages
      }
    })
  }

  from_csv(domain_name, language, file) {
    const formData = new FormData();
    let blob = new Blob([file.data], {type: 'text/csv'});
    formData.append("file", blob, file.meta.name)
    return this.post_(`${domain_name}/from_csv`, formData, {
      params: {
        language
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
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

  get_shared(uuid, entry_access_key) {
    return this.get_(`${uuid}/get_shared/${entry_access_key}`)
  }

  get_slug_lang(slug, language) {
    return this.get_(`${slug}`, {
      params: {
        language
      }
    })
  }

  // TODO why this slash?? otherwise it throws a 405 on the server!
  post(entry_data) {
    return this.post_(`${entry_data.uuid}`, entry_data)
  }

  patch(entry_data) {
    return this.patch_(`${entry_data.uuid}`, entry_data)
  }

  as_csv(slug, languages) {
    return this.get_(`as_csv${slug}`, {
      params: {
        languages
      }
    })
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

  aspects_as_index_table(slug, language) {
    return this.get_(`${slug}/aspects_as_index_table`, {params: {language}})
  }

  async update_aspects_as_index_table(slug, language) {
    return this.get_(`${slug}/update_aspects_as_index_table`, {params: {language}})
  }

  async post_from_flat(slug, language, content) {
    return this.post_(`${slug}/from_flat`, content, {
      params: {language}
    })
  }

  async patch_from_flat(slug, language, content) {
    return this.patch_(`${slug}/from_flat`, content, {
      params: {language}
    })
  }

  async from_csv(slug, language, file) {
    const formData = new FormData();
    let blob = new Blob([file.data], {type: 'text/csv'});
    formData.append("file", blob, file.meta.name)
    return this.post_(`${slug}/from_csv`, formData, {
      params: {
        language
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  async get_entry_of_version(slug, language, version) {
    return this.get_(`${slug}/get_entry_of_version`, {
      params: {
        language,
        version
      }
    })
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

  get_codes_templates(language, full = true) {
    return this.get_("get_codes_templates", {params: {language, full}})
  }

  download(uuids, meta_only) {
    return this.post_("download", uuids, {
      params: {
        meta_only
      },
      headers: {
        "Access-Control-Allow-Headers": "Access-Control-Expose-Headers, Access-Control-Request-Headers",
        "Access-Control-Expose-Headers": "Content-Disposition",
        "response-type": "arraybuffer"
        // "Access-Control-Request-Headers": "Content-Disposition"
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

  validate_session() {
    return this.get_("validate_session")
  }

  get_me() {
    return this.get_("me")
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

  get_component_as_csv(component, languages) {
    return this.get_("get_component_as_csv", {
      params: {
        component, languages
      }
    })
  }

  user_guide_url(language_code) {
    return this.get_("user_guide_url", {
      params: {
        language_code
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

  language_status(lang_code) {
    return this.get_("language_status", {params: {lang_code}})
  }

  change_language_status(lang_code, active) {
    return this.post_("change_language_status", null, {
      params: {
        lang_code, active
      }
    })
  }

  update_messages_from_csv(component, language, file) {
    const formData = new FormData();
    let blob = new Blob([file.data], {type: 'text/csv'});
    formData.append("file", blob, file.meta.name)
    return this.post_("update_messages_from_csv", formData, {
      params: {
        component, language
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

}

class Util extends QueryBase {

  constructor(api_wrapper) {
    super(api_wrapper, "/util")
  }

  init_data_translation_csv(domain, type, slug, language, dest_language) {
    return this.get_("init_data_translation_csv", {
      params: {
        domain, type, slug, language, dest_language, separator: ","
      }
    })
  }
}


Vue.prototype.$api = new APIWrapper()
