export const settings_loc_privacy_exact = "exact location"
export const settings_loc_privacy_random = "randomly moved"
export const settings_loc_privacy_ask = "always ask"

// export const settings_loc_privacy_activate = [settings_loc_privacy_random, settings_loc_privacy_ask]

export const settings_aspects = [
  {
    name: "location_privacy",
    label: "Location privacy",
    description: "Specify the settings for the protection of the exact locations of your entries",
    type: "select",
    attr: {
      unpacked: true
    },
    items: [
      "exact location",
      settings_loc_privacy_random,
      // settings_loc_privacy_ask
    ],
    value: null,
  }
]

export const default_settings = {
  location_privacy: "randomly moved"
}
