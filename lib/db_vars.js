import {ENTRIES_SET_FROM_ARRAY} from "~/store/entries";
import {USER_SET_AUTH_TOKEN, USER_SET_SETTINGS, USER_SET_USER_DATA} from "~/store/user";

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
    store_mutation: USER_SET_USER_DATA
  },
  {
    name: "user_settings",
    store_mutation: USER_SET_SETTINGS
  },
  {
    name: "auth_token",
    store_mutation: USER_SET_AUTH_TOKEN
  }]
