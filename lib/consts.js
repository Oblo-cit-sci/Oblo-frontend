export const GLOBAL = "global" // appears in entryType.meta.context

//export const CONTEXT_ENTRY = "context-entry";

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
export const ENTRY_LINK_FOLLOW = "entry_link_follow"  //allows to select a 'collect' link to the entry

export const META = "meta"

//export const COMPONENT = "component" // TODO can for the aspect_loc maybe be dump later for ASPECT, if the act location is stored... the type of the actual 'select'

export const LIST_INDEX = "list_index"

export const LOGIN_WRONG_CREDENTIALS = "LOGIN_WRONG_CREDENTIALS";
export const LOGIN_ALREADY_LOGGED_IN = "LOGIN_ALREADY_LOGGED_IN";

export const VIEW = "view"
// export const CREATE = "create"
export const EDIT = "edit"
export const REVIEW = "review"
export const FLEX = "flex"

// ATTR things
export const VIEW_COMPONENT = "view_component"

// status. TODO more
export const DRAFT = "draft"
export const STORED = "stored"  // for  private local, or offline, the final state
export const PUBLISHED = "published"
export const REQUIRES_REVIEW = "requires_review"
export const REJECTED = "rejected"

// export const SUBMITTED = "submitted" //

export const PUBLIC = "public"
export const PRIVATE = "private"
export const PRIVATE_LOCAL = "private local"

// used for composites
export const TITLE_UPDATE = "title_update"

export const GLOBAL_ROLE = "global_role"
// Userroles
export const VISITOR = "visitor"
export const ADMIN = "admin"
export const INVESTIGATOR = "investigator"
export const EDITOR = "editor"

// important fields in entry types

export const TITLE_ASPECT = "titleAspect"
export const ID_ASPECT = "IDAspect"

export const TITLE = "title"

// aspect types
export const STR = "str"
export const HEAD = "head"
export const INT = "int"
export const FLOAT = "float"
export const SELECT = "select"
export const MULTISELECT = "multiselect"
export const IMAGES = "images"
export const AUDIO = "audio"
export const LIST = "list"
export const ENTRYLIST = "entrylist"
export const DATE = "date"
export const TREE = "tree"
export const TREEMULTISELECT = "treemultiselect"
export const LOCATION = "location"
export const COMPOSITE = "composite"
export const OPTIONS = "options"
export const ENTRYLINK = "entrylink"
export const EXTERNAL_ACCOUNT = "external_account"
export const VIDEO = "video"
export const ENTRY_ROLES = "entry_roles"
export const OPTION = "option"
export const MONTH = "month"
export const GEOMETRY = "geometry"
export const USER = "user"
//
export const SIMPLETEXTVIEW = "simpletextview"

// composite views
export const URL = "url"


// Base entry types
export const TEMPLATE = "template"
export const CODE = "code"
export const REGULAR = "regular"

export const LANGUAGE = "language"
export const TAGS = "tags"
export const TAG = "tag"
export const FILTER = "filter"
export const DOMAIN = "domain"
export const PRIVACY = "privacy"
export const LICENSE = "license"
export const ACTORS = "actors"
export const STATUS = "status"


export const META_ASPECT_LIST = [PRIVACY, LICENSE, ACTORS]

export const ASPECT_SEARCH = "aspect_search"

// Domains
export const NO_DOMAIN = "no_domain"

export const VALUE = "value"


export const SIMPLE_TYPE = [STR, INT, FLOAT, DATE, SELECT, TREE]

// ********* MAP
// MODE
export const MODE_NORMAL = "m_mode_normal"
export const default_place_type = ["place", "district", "region", "country"]

export const TYPE_SLUG = "type_slug"
export const SLUG = "slug"

// ALL QUERY-PARAM KEYS
export const QP_D = "d" // domain-name
export const QP_F = "f" // domain-name (fixed)
export const QP_SEARCH = "search" // search query
export const QP_UUID = "uuid" // entry-uuid
export const QP_ENTRY_MODE = "entry_mode" // entry_mode. view, edit, review
export const QP_ENTRY_ACCESS_KEY = "eak"
export const QP_lang = "lang"
/*
export const MULTISELECT = "multiselect"
export const LIST = "list"
export const ENTRYLIST = "entrylist"
export const COMPOSITE = "composite"
export const OPTIONS = "options"
export const OPTION = "option"
*/

// SETTINGS
export const UI_LANGUAGE = "ui_language"
export const DOMAIN_LANGUAGE = "domain_language"
export const FIXED_DOMAIN = "fixed_domain"

// MENU MODE
export const MENU_MODE_MAIN = 0
export const MENU_MODE_DOMAIN = 1


export const RESPONSE_ERROR_MSG = "response.data.error.msg"
export const MSG_PATH_SOMETHING_WENT_WRONG = "comp.snackbar.something_went_wrong"

export const draft_color = "#2196F3"
export const review_color = "#e8a622"
export const cluster_color = "#f6ff7a"

// NEW FILTERNAMES
export const ACTOR = "actor"

// ASPECT STATES
export const ASP_UNSET = "unset"
export const ASP_SET  = "set"
export const ASP_DISABLED = "disabled"
export const ASP_ERROR = "error"

// FOR TRANSLATION
export const FRONTEND_COMPONENT = "fe"
export const BACKEND_COMPONENT = "be"
export const ENTRIES = "entries"

// export const ENTRY = "entry"

export const SRC_LANG = "src_lang"
export const DEST_LANG = "dest_lang"

// used as the entries download option
export const METADATA = "metadata"

export const NOT_DOWNLOADING = 0
export const DOWNLOADING = 1
