import {
  ADD_META,
  ENTRYTYPES_SET_NOTES,
  ENTRYTYPES_UPDATE_ENTRY_TYPES,
  SET_DRAFT_NUMBERS,
  SET_STORED_ENTRIES
} from "~/lib/store_consts";

export const db_vars = [{
  name: "entries",
  store_mutation: SET_STORED_ENTRIES
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
  }]
