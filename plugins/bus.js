import Vue from 'vue'

Vue.prototype.$bus = new Vue()

export const BUS_OVERLAY = "overlay"
export const BUS_HIDE_OVERLAY = "hide_overlay"

export const BUS_TRIGGER_SEARCH = "trigger_search"

export const BUS_MAP_MARKER_SHOW = "map-marker-show"
export const BUS_MAP_MARKER_HIDE = "map-marker-hide"

export const BUS_ADD_SOURCE_TO_MAP = "add-source-to-map"
export const BUS_ADD_LAYER_TO_MAP = "add-layer-to-map"

export const BUS_REMOVE_SOURCE_FROM_MAP = "remove-source-from-map"
export const BUS_REMOVE_LAYER_FROM_MAP = "remove-layer-from-map"

// TODO should do the action of the 2 below
export const BUS_MAP_GOTO_GEOMETRY_FEATURE_VALUE = "map-goto-geometry-feature-value"
export const BUS_MAP_FLY_TO = "map-fly-to"
export const BUS_MAP_FIT_BOUNDS = "map-fit-bounds"

export const BUS_MAP_LOADED = "map-loaded"

export const BUS_DIALOG_OPEN = "dialog-open"
