export const DELETE = "delete"

export const ADDED_SOURCE = "added_source"
export const ADDED_LAYER = "added_layer"
export const ADDED_LINE_LAYER = "added_line_layer"

export const TEMP_SOURCE = "temp_points_source"
export const TEMP_POINT_LAYER = "temp_points_layer"
export const TEMP_LINE_LAYER = "temp_line_layer"

export const CURRENT_SINGULAR_POINTS = "current_singular_points"
export const CURRENT_POINTS_INVISIBLE = "current_points_invisible"

export const color_default_added_layer = '#33796d'
export const color_hover_circle = '#faed00'
export const color_current_feature = "#fce00c"

export const state_mark_finish = "state_mark"
export const state_hover = "state_hover"

export const CLICK = "click"
export const MOUSEENTER = "mouseenter"
export const MOUSELEAVE = "mouseleave"
export const TOUCHSTART = "touchstart"
export const MOUSEDOWN = "mousedown"
export const MOUSEMOVE = "mousemove"
export const TOUCHEND = "touchend"
export const TOUCHMOVE = 'touchmove'
export const MOUSEUP = "mouseup"

export const geojson_wrap = (data) => ({type: "geojson", data})
