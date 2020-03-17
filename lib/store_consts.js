// *********** Index
export const CLEAR_DOMAIN = "clear_domain"
export const CLEAR = "clear"
export const UPDATE_DRAFT_NUMBER = "update_draft_number"
export const ADD_META = "add_meta"
export const DELETE_DOMAIN = "delete_domain"
export const INIT = "init"
export const INITIALIZED = "initialized"
export const CONNECTION = "connection"
export const CONNECTING = "connecting"
export const USER_KEY = "user_key"
export const SET_STORED_ENTRIES = "set_stored_entries"
export const SET_DRAFT_NUMBERS = "set_draft_numbers"
export const SET_DOMAINS = "set_domains"
export const SET_DOMAIN_TEMPLATES_FETCHED = "set_domain_templates_fetched"
export const BACKUP_INIT = "backup_init"
export const GET_CODE = "get_code"
export const SET_TEMPLATES_CODES_FOR_DOMAIN = "set_templates_codes_for_domain"
export const CLEAR_ENTRIES = "clear_entries"

// export const DB_LOADED = "db_loaded" mut and getter, cool?
// because only setter
// Getter
// export const RELEASE_MODE = "release_mode"
export const DB_LOADED = "db_loaded"
export const DOMAINS = "domains"
export const SET_DOMAIN = "set_domain"
export const INIT_PAGE_PATH = "init_page_path"
export const PUSH_PAGE_PATH = "push_page_path"
export const POP_LAST_PAGE_PATH = "pop_last_page_path"
export const GET_DOMAIN_TEMPLATES_FETCHED = "get_domain_templates_fetched"
export const UPDATE_DRAFT_NUMBERS = "update_draft_numbers"

export const CONNTECTING = "connecting"
export const CONNECTED = "connected"
export const USER_GET_USER_DATA = "user/get_user_data"


export const DOMAIN = "domain"
export const DOMAIN_BY_NAME = "domain_by_name"
export const DOMAIN_TITLE = "domain_title"
export const DRAFT_NO = "draft_no"
export const LAST_BASE_PAGE_PATH  = "last_page_path"

// internal mutations
export const ADD_CODES = "add_codes"

// *********** Entries



// ******** Entrytypes
// Mutations
export const ENTRYTYPES_UPDATE_ENTRY_TYPES = "entrytypes/update_entry_types"
export const ENTRYTYPES_ADD_TEMPLATES = "entrytypes/add_templates"
export const ENTRYTYPES_INIT_NOTES = "entrytypes/init_notes"
export const ENTRYTYPES_ADD_NOTE = "entrytypes/add_note"
export const ENTRYTYPES_INIT_ASPECT_NOTE = "entrytypes/init_aspect_note"
export const ENTRYTYPES_SET_TYPE_NOTES = "entrytypes/set_type_notes"
export const ENTRYTYPES_SET_TYPES = "entrytypes/set_types"
export const ENTRYTYPES_SET_NOTES = "entrytypes/set_notes"
// Getter
export const ENTRYTYPES_HAS_TYPE  = "entrytypes/has_type"
export const ENTRYTYPES_TYPE = "entrytypes/entry_type"
export const ENTRYTYPES_TYPENAME  = "entrytypes/type_name"

export const ENTRYTYPES_TYPES = "entrytypes/entrytypes"
export const ENTRYTYPES_OF_DOMAIN = "entrytypes/entrytypes_of_domain"
export const ENTRYTYPES_GET_ASPECT_DEF = "entrytypes/get_aspect_def"

export const ENTRYTYPES_TYPES_ARRAY = "entrytypes/entry_types_array"
export const ENTRYTYPES_ALL_NOTES = "entrytypes/all_notes"
export const ENTRYTYPES_TYPE_NOTES = "entrytypes/type_notes"
export const ENTRYTYPES_NOTE = "entrytypes/note"

// ********* User
// Mutations
export const USER_LOGIN = "user/login"
export const USER_LOGOUT = "user/logout"
export const USER_LOGGED_IN = "user/logged_in"
export const USER_SET_USER_DATA = "user/set_user_data"
export const USER_RESET_AUTH_TOKEN = "user/reset_auth_token"
export const USER_SET_AUTH_TOKEN = "user/set_auth_token"
export const USER_GET_AUTH_TOKEN = "user/get_auth_token"
export const GET_ENTRY = "get_entry"
//export const ENTRIES_ADD_CHILD = "entries/add_child"

// ******** SNACKBAR
export const SNACKBAR = "snackbar"
export const SNACKBAR_RESET = "snackbar_reset"
export const SNACKBAR_TRIGGER = "snackbar_trigger"

// ********  MAP
// Mutations
export const MAP_SET_ENTRIES = "map/set_entries"
export const MAP_SET_TO_SELECT_ASPECT_LOCATION = "map/set_to_select_aspect_location"
export const MAP_RESET_TO_SELECT_ASPECT_LOCATION = "map/reset_to_select_aspect_location"
export const MAP_GOTO_LOCATION = "map/goto_location" // also getter
export const MAP_ARKER_POINT = "map/marker_point"
// internal
export const _SELECT_ENTRY = "_select_entry"

// Getters
export const MAP_LAST_GOTO_LOCATION = "map/last_goto_location"

// Actions
export const MAP_GOTO_DONE = "map/goto_done"
export const MAP_RESET_GOTO_LOCATIONS = "map/reset_goto_locations"

