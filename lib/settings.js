export const settings_loc_privacy_exact = "exact location"
export const settings_loc_privacy_random = "randomly moved"
export const settings_loc_privacy_ask = "always ask"

// TODO remove this module! move aspects to TypicalAspectMixin.js

// export const settings_loc_privacy_activate = [settings_loc_privacy_random, settings_loc_privacy_ask]

export const default_settings = {
  location_privacy: settings_loc_privacy_ask,
  fixed_domain: null,
  ui_language: "en",
  domain_language: "en",
  default_license: "CC0", // should come from the server
  default_privacy: "public",
}

export const overwrite_default_register_settings = {
  default_license: "CC-BY-NC-SA"
}
