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
// Mutations
export const ENTRIES_ADD_TIMELINE_ENTRIES = "entries/add_timeline_entries"
export const ENTRIES_SET_DOWNLOADED = "entries/set_downloaded"
export const ENTRIES_ENTRIES_SET_LOCAL_LIST_PAGE = "entries/entries_set_local_list_page"
export const ENTRIES_SET_ENTRY_STATUS = "entries/set_entry_status"
export const SET_DIRTY = "set_dirty"
export const ENTRIES_CLEAR = "entries/clear"

// internal
export const _SET_ENTRY_VALUE = "_set_entry_value"
// Getter
export const ENTRIES_HAS_ENTRY = "entries/has_entry"
export const ENTRIES_GET_ENTRY = "entries/get_entry"
export const ENTRIES_GET_ENTRIES = "entries/get_entries"
// Actions
export const ENTRIES_SAVE_ENTRY = "entries/save_entry"
export const ENTRIES_UPDATE_ENTRY = "entries/update_entry"

export const ENTRIES_SET_EDIT = "entries/set_edit"
export const ENTRIES_CREATE_CHILD = "entries_create_child"
export const ENTRIES_SAVE_CHILD_N_REF = "entries/save_child_n_ref"


export const ENTRIES_ALL_ENTRIES_ARRAY = "entries/all_entries_array"
export const ENTRIES_GET_ENTRY_TITLE = "entries/get_entry_title"
export const ENTRIES_GET_PARENT = "entries/get_parent"
export const ENTRIES_ENTRY_TITLE = "entries/get_entry_title"
export const ENTRIES_DOMAIN = "entries/domain"
export const ENTRIES_ALL_ENTRIES_OF_TYPE = "entries/all_entries_of_type"

export const ENTRIES_USER_RIGHTS = "entries/user_rights"

export const ENTRIES_VALUE = "entries/value"
export const ENTRIES_DRAFTS = "entries/all_drafts"
export const ENTRIES_GET_EDIT = "entries/get_edit"

export const EDIT_UUID = "entries/edit_uuid"
//
export const ENTRIES_SET_ENTRY_VALUE = "entries/set_entry_value"
export const ENTRIES_DELETE_ENTRY = "entries/delete_entry"

export const ENTRIES_EDIT_DELETE_REF_CHILD = "entries/delete_edit_ref_child"
export const ENTRIES_GET_RECURSIVE_ENTRIES = "entries/get_recursive_entries"
export const ENTRIES_GET_CHILDREN = "entries/get_children"

export const ENTRIES_SET_EDIT_CLEAN = "entries/set_edit_clean"


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

export const GET_ENTRY = "get_entry"
//export const ENTRIES_ADD_CHILD = "entries/add_child"

// ******** SNACKBAR
export const SNACKBAR = "snackbar"
export const SNACKBAR_RESET = "snackbar_reset"

// ******** VIEW_SEARCH
export const SEARCH_GET_ENTRIES = "search/get_entries"
export const SEARCH_ENTRY_ASPECT = "search/get_entry_aspects"
export const SEARCH_CLEAR = "search/clear"
export const CLEAR_SEARCH = "search/clear"
export const SEARCH_SET_ENTRIES = "search/set_entries"
export const SEARCH_GET_ENTRY = "search/get_entry"

export const SEARCH_SET_SEARCH_COUNT = "search/set_search_count"
export const SEARCH_GET_SEARCH_COUNT = "search/get_search_count"


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

