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
      "randomly moved",
      "always ask"
    ],
    value: null,
  }
]

export const default_settings = {
  location_privacy: "randomly moved"
}
