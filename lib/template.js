import {PUBLIC, TITLE_ASPECT, USER} from "~/lib/consts"
import {can_edit_entry, is_visitor} from "~/lib/actors"
import {aspect_default_value} from "~/lib/aspect"

const _ = require("lodash")

function template_rule(template, rule_name, default_val) {
  return _.get(template.rules, rule_name, default_val)
}

export function view_mode_hide_unset_values(template) {
  return template_rule(template, "view_mode_hide_unset_values", false)
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

export function allow_download(template) {
  return template_rule(template, "allow_download", true)
}

export function template_create_rule(template) {
  return template_rule(template, "create", PUBLIC)
}

export function template_titleAspect(template) {
  return template_rule(template, TITLE_ASPECT, null)
}

export function template_default_values(template) {
  let values = {}
  let aspects = template.aspects
  for (let aspect_i in aspects) {
    let aspect = aspects[aspect_i]
    //console.log("lib/entry: default value of aspect", aspect)
    values[aspect.name] = aspect_default_value(aspect)
  }
  return values
}

export function edit_mode_question_only(template) {
  return template_rule(template, "edit_mode_question_only", true)
}

export function create_template_options(templates, user) {
  // todo needs refinement, what if this can be changed per user...
  return templates.filter(t => {
    const create_rule = template_create_rule(t)
    return (
      create_rule === PUBLIC ||
      (create_rule === USER && !is_visitor(user)) ||
      can_edit_entry(user, t))
  })
}
