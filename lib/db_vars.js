import {
  ADD_META, ENTRIES_SET_FROM_ARRAY,
  ENTRYTYPES_SET_NOTES,
  ENTRYTYPES_UPDATE_ENTRY_TYPES,
  SET_DRAFT_NUMBERS,
  SET_STORED_ENTRIES, USER_GET_AUTH_TOKEN, USER_SET_AUTH_TOKEN, USER_SET_USER_DATA
} from "~/lib/store_consts";

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
    store_mutation: ENTRYTYPES_SET_NOTES
  },
  {
    name: "entrytypes",
    store_mutation: ENTRYTYPES_UPDATE_ENTRY_TYPES
  },
  {
    name: "user_data",
    store_mutation: USER_SET_USER_DATA
  },
  {
    name: "auth_token",
    store_mutation: USER_SET_AUTH_TOKEN
  }]
