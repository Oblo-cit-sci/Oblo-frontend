import Vue from 'vue'

Vue.prototype.$bus = new Vue()

export const BUS_OVERLAY = "overlay"
export const BUS_HIDE_OVERLAY = "hide_overlay"

export const BUS_TRIGGER_SEARCH = "trigger_search"

export const BUS_MAP_MARKER_SHOW = "map-marker-show"
export const BUS_MAP_MARKER_HIDE = "map-marker-hide"
