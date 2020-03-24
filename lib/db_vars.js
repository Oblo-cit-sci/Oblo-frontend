import {ENTRIES_SET_FROM_ARRAY} from "~/store/entries";
import {ADD_META, SET_DRAFT_NUMBERS, SET_STORED_ENTRIES} from "~/store";
import {TEMPLATES_SET_NOTES, TEMPLATES_UPDATE_ENTRY_TYPES} from "~/store/templates";
import {USER_GET_AUTH_TOKEN, USER_SET_AUTH_TOKEN, USER_SET_USER_DATA} from "~/store/user";

export const db_vars = [{
  name: "entries",
  store_mutation: ENTRIES_SET_FROM_ARRAY
},
  {
    name: "draft_numbers",
    store_mutation: SET_DRAFT_NUMBERS
  },
  {
    name: "user_key",
    store_mutation: ADD_META
  },
  {
    name: "notes",
    store_mutation: TEMPLATES_SET_NOTES
  },
  {
    name: "entrytypes",
    store_mutation: TEMPLATES_UPDATE_ENTRY_TYPES
  },
  {
    name: "user_data",
    store_mutation: USER_SET_USER_DATA
  },
  {
    name: "auth_token",
    store_mutation: USER_SET_AUTH_TOKEN
  }]
