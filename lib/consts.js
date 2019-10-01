
export const GLOBAL = "global" // appears in entryType.meta.context

export const CONTEXT_ENTRY = "context-entry";

// entry context
// used for aspect_loc
export const ENTRY = "entry"
export const ASPECT = "aspect"
export const COMPONENT = "component"
export const INDEX = "index"
export const LINKED_INDEX = "linked_index"
export const LINKED_ENTRY_INDEX = "linked_entry_index"
export const PARENT = "parent"
export const ENTRY_INDEX = "entry_index" // for listOf index
export const COLLECT = "collect"
export const COLLECT_CLOSE = "collect_close"
export const ENTRY_COLLECT = "entry_collect"
export const ENTRY_COLLECT_CLOSE = "entry_collect_close"
export const ENTRY_COLLECT_LINK = "entry_collect_link" // creates a array with text, value pairs, where the text, can be specified further as in collect, but the value is the uuid
export const ENTRY_LINK_FOLLOW =  "entry_link_follow"  //allows to select a 'collect' link to the entry

//export const COMPONENT = "component" // TODO can for the aspect_loc maybe be dump later for ASPECT, if the act location is stored... the type of the actual 'select'

export const LIST_INDEX = "list_index"

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

export const REGULAR = "regular"
