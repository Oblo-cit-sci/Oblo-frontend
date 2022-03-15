const _ = require("lodash")

function template_rule(template, rule_name, default_val) {
  return _.get(template.rules, rule_name, default_val)
}

export function view_mode_hide_unset_values(template) {
  return template_rule(template,"view_mode_hide_unset_values", false)
}

export function one_aspect_per_page(template) {
  return template_rule(template, "one_aspect_per_page", false)
}

export function pages(template) {
  return template_rule(template, "pages", [])
}

// todo not sure if this is really used...
export function named_pages(template) {
  return template_rule(template, "named_pages", false)
}

export function locationAspect(template) {
  return template_rule(template, "locationAspect", null)
}
