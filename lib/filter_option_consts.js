import {entries_domain_filter2} from "./search";
// todo replace entries_domain_filter2 by something generalized and nicer, see function...
export const domain_filter_options = {
  name: "Domain",
  store_getter: "domain_options",
  filter_method: "domain",
  init_getter: "domain",
  placeholder: "All domains"
}


export const entrytype_filter_options = {
  name: "Entytype",
  store_getter: "containing_template_options",
  filter_method: "template",
  placeholder: "All types"
}
