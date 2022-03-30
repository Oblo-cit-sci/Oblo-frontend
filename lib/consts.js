export const GLOBAL = "global" // appears in entryType.meta.context

//export const CONTEXT_ENTRY = "context-entry";

// entry context
// used for aspect_loc
export const ENTRY = "entry" // its a page

export const ASPECT = "aspect"

export const COMPONENT = "component" // message component

export const INDEX = "index" // its a page


export const META = "meta"


export const VIEW = "view"
export const EDIT = "edit"
export const REVIEW = "review"

// ATTR things
export const VIEW_COMPONENT = "view_component"

// status. TODO more
export const DRAFT = "draft"
export const STORED = "stored"  // for  private local, or offline, the final state
export const PUBLISHED = "published"
export const REQUIRES_REVIEW = "requires_review"
export const REJECTED = "rejected"


export const PUBLIC = "public"
export const PRIVATE = "private"
export const PRIVATE_LOCAL = "private local"


// Userroles
export const VISITOR = "visitor"
export const ADMIN = "admin"
export const INVESTIGATOR = "investigator"
export const EDITOR = "editor"

// important fields in entry types

export const TITLE_ASPECT = "titleAspect"

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



// Domains
export const NO_DOMAIN = "no_domain"

export const VALUE = "value"


export const SIMPLE_TYPE = [STR, INT, FLOAT, DATE, SELECT, TREE]

// ********* MAP
// MODE
export const default_place_type = ["place", "district", "region", "country"]

export const TYPE_SLUG = "type_slug"
export const SLUG = "slug"

// ALL QUERY-PARAM KEYS
export const QP_D = "d" // domain-name
export const QP_F = "f" // domain-name (fixed)
export const QP_SEARCH = "search" // search query, TODO just s?
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

export const LIST_ITEMS = "list_items"

// Geometry
export const POINT = "Point"
export const LINESTRING = "LineString"
export const MULTIPOINT = "MultiPoint"
export const POLYGON = "Polygon"
export const FEATURE_COLLECTION = "FeatureCollection"


export const ALL_GEOMETRY_TYPES = [POINT, LINESTRING, POLYGON]
export const GEOMETRY_ICONS = [
  {
    icon: "mdi-map-marker",
    type: POINT,
  },
  {
    icon: "mdi-map-marker-multiple",
    type: MULTIPOINT,
  },
  {
    icon: "mdi-vector-polyline",
    type: LINESTRING,
  },
  {
    icon: "mdi-vector-polygon",
    type: POLYGON,
  }
]

export const DEVELOPMENT = "development"
