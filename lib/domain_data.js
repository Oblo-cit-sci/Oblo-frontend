export function domain_title(domain_data) {
  return domain_data.title
}

export function domain_description(domain_data) {
  return domain_data.description
}

export function domain_banner_url(api, domain_name) {
  return api.static.domain_banner(domain_name)
}

export function domain_icon_url(api, domain_name) {
  return api.static.domain_icon(domain_name)
}

export function map_additional_layers(domain_data) {
  return domain_data.map?.additional_layers || []
}
