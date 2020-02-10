const ld = require("lodash")

export function aspect_by_name(e_type, aspect_name) {
  return ld.find(e_type.aspects, a => a.name === aspect_name)
}
