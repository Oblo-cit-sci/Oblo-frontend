<template lang="pug">
  v-container
    v-item-group(v-model="i_value" :multiple="multiple")
      v-row(:style="row_style")
        v-col.pa-1(v-for="(c, i) in options" :key="i" :style="cell_style")
          v-item(v-slot:default="{ active, toggle }")
            div.rounded(:style="cell_select_style(active)")
              v-img.grid-img.sel_cursor(v-if="c.icon" :src="get_icon_url(c.icon)"
                max-width="80%" contain @click="toggle" position="center")
              .text-block.pt-2(v-if="!no_text")
                span {{c.text ? c.text : "&nbsp;"}}
</template>

<script>
import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"
import OptionsMixin from "~/components/aspect_utils/OptionsMixin"
import {unpack} from "~/lib/aspect"

export default {
  name: "SelectGrid2",
  mixins: [AspectComponentMixin, OptionsMixin],
  components: {},
  props: {
    input: Object,
    _multiple: Boolean,
    _no_text: {
      type: Boolean,
    },
    // options: Array, // of objects: text, value, icon (url)
    _max_row_width: {
      type: Number
    },
    _max_cell_width: {
      type: Number
    },
    _no_border: {
      type: Boolean
    }
  },
  data() {
    return {}
  },
  computed: {
    i_value: {
      get: function () {
        if (this.multiple) {
          this.value.map(v => this.$_.findIndex(this.options, o => this.$_.isEqual(o.value, v)))
        } else {
          // todo
        }
      },
      set: function (val) {
        let up = null
        if (this.multiple) {
          up = this.$_.flatten(this.$_.filter(this.options, (o, i) => val.includes(i)).map(v => v.value))
        } else {
          up = this.proper_up_val(this.options[val])
        }
        this.update_value(up)
      }
    },
    options() {
      return this.get_items(this.aspect.items)
    },
    row_style() {
      return {
        "max-width": (this._max_row_width || 320) + "px"
      }
    },
    cell_style() {
      return {
        "max-width": this.max_cell_width + "px",
        "border": this.no_border ? "none" : "1px grey solid"
      }
    },
    no_text() {
      return this._no_text || this.$_.get(this.aspect.attr, "no_text", false)
    },
    no_border() {
      return this._no_border || this.$_.get(this.aspect.attr, "no_border", false)
    },
    max_cell_width() {
      return this._max_cell_width || this.$_.get(this.aspect.attr, "max_cell_width", 160)
    },
    multiple() {
      return this._multiple || this.aspect.type === "multiselect"
    }
  },
  methods: {
    cell_select_style(active) {
      return {
        "background": active ? "khaki" : "",
        "padding": "2px"
      }
    },
    get_icon_url(icon) {
      if (this.data_source) {
        return this.$api.url_entry__$slug__entry_file__$file_name(this.data_source, icon)
      } else {
        return this.$api.get_static_url(icon)
      }
    }
  }
}
</script>

<style scoped>

.grid-img {
  margin: auto;
}

.text-block {
  text-align: center;
}
</style>
