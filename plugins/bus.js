import Vue from 'vue'

Vue.prototype.$bus = new Vue()

export const BUS_OVERLAY = "overlay"
export const BUS_HIDE_OVERLAY = "hide_overlay"

export const BUS_TRIGGER_SEARCH = "trigger_search"

export const BUS_MAP_MARKER_SHOW = "map-marker-show"
export const BUS_MAP_MARKER_HIDE = "map-marker-hide"

export const ADD_SOURCE_TO_MAP = "add-source-to-map"
export const ADD_LAYER_TO_MAP = "add-layer-to-map"

export const REMOVE_SOURCE_FROM_MAP = "remove-source-from-map"
export const REMOVE_LAYER_FROM_MAP = "remove-layer-from-map"

export const BUS_MAP_LOADED = "map-loaded"

export const BUS_DIALOG_OPEN = "dialog-open"
