
export const GLOBAL = "global" // appears in entryType.meta.context

export const CONTEXT_ENTRY = "context-entry";

// entry context
// used for aspect_loc
export const ENTRY = "entry"
export const ASPECT = "aspect"
export const INDEX = "index"
export const COLLECT = "collect"

export const LOGIN_WRONG_CREDENTIALS = "LOGIN_WRONG_CREDENTIALS";
export const LOGIN_ALREADY_LOGGED_IN = "LOGIN_ALREADY_LOGGED_IN";

export const VIEW = "view"
export const CREATE = "create"
export const EDIT = "edit"

// status. TODO more
export const DRAFT = "draft"
export const STORED = "stored"  // for  private local, or offline, the final state
export const SUBMITTED = "submitted" //

export const PUBLIC = "public"
export const PRIVATE = "private"
export const PRIVATE_LOCAL = "private local"

export const ENTRYACTION = "entryAction"
// actions
export const AUTOSAVE = "autosave"
export const SAVE = "save"
export const GLOBAL_ASPECT_REF = "set_global_aspect_ref"
export const CREATE_CONTEXT_ENTRY = "create_context_entry"
export const DELETE_CONTEXT_ENTRY = "delete_context_entry"

export const ASPECTACTION = "aspectAction"
// used for composites
export const TITLE_UPDATE = "title_update"

// Userroles
export const VISITOR = "visitor"
export const ADMIN = "admin"
export const INVESTIGATOR = "investigator"
export const EDITOR = "editor"

// important fields in entry types

export const TITLE_ASPECT  = "titleAspect"


// aspect types
export const STR = "str"
export const INT = "int"
export const FLOAT = "float"
export const SELECT = "select"
export const MULTISELECT = "multiselect"
export const LIST = "list"
export const LIST_OF = "listof"
export const GPS = "gps"
export const DATE = "date"
export const TREE = "tree"
export const COMPOSITE = "composite"
export const OPTIONS = "options"
export const MAP = "map"
export const USER = "user"
