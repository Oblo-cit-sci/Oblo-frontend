import {ENTRIES_SET_FROM_ARRAY} from "~/store/entries";

export const db_vars = [{
  name: "entries",
  store_mutation: ENTRIES_SET_FROM_ARRAY
},
  {
    name: "notes",
    store_mutation: "templates/set_notes"
  },
  {
    name: "entrytypes",
    store_mutation: "templates/update_entry_types"
  },
  {
    name: "user_data",
    store_mutation: "user/set_user_data"
  },
  {
    name: "user_settings",
    store_mutation: "user/set_settings"
  },
  {
    name: "auth_token",
    store_mutation: "user/set_auth_token"
  }]
