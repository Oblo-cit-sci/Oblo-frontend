
export const settings_loc_privacy_exact = "exact location"
export const settings_loc_privacy_random = "randomly moved"
export const settings_loc_privacy_ask = "always ask"


export const default_settings = {
  location_privacy: settings_loc_privacy_ask,
  fixed_domain: null,
  ui_language: null,
  domain_language: null,
  default_license: "CC0", // should come from the server
  default_privacy: "public",
}

export const overwrite_default_register_settings = {
  default_license: "CC-BY-NC"
}
