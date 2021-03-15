import Vue from 'vue'

Vue.prototype.$bus = new Vue()

export const BUS_OVERLAY = "overlay"
export const BUS_HIDE_OVERLAY = "hide_overlay"
