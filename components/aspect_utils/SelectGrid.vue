<template lang="pug">
  div
    div.d-flex.flex-wrap
      .cell(v-for="(c, i) in options" :key="i" :style="cell_style")
        v-container
          v-row.mt-2.justify-center
            v-img.sel_cursor(v-if="c.icon" :src="get_icon_url(c.icon)" width="80%"
              max-width="80%" max-height="80%" contain @click="select(c)" class="")
          v-row.mt-3.mb-2.justify-center
            div.sel_cursor.px-1(@click="select(c)" :style="text_size(c)") {{c.text}}
</template>

<script>
import SelectComponentMixin from "~/components/aspect_utils/SelectComponentMixin"

export default {
  name: "SelectGrid",
  mixins: [SelectComponentMixin],
  components: {},
  props: {
    options: Array, // of objects: text, value, icon (url)
    default_image_url: String,
    max_cell_width: {
      type: Number,
      default: 160
    },
    no_border: Boolean
  },
  data() {
    return {
      img_loaded: []
    }
  },
  created() {
    for (let i in this.options) {
      this.img_loaded.push(false)
    }
  },
  computed: {
    cell_style() {
      return {
        "max-width": this.max_cell_width + "px",
        "border": this.no_border ? "none" : "1px grey solid"
      }
    }
  },
  methods: {
    select(value) {
      this.$emit("selection", value)
    },
    text_size(item) {
      if (item.text.length > 60) {
        return {'font-size': '90%'}
      }
    }
  },
  watch: {}
}
</script>

<style scoped>

.cell {
  margin: 0 2px 2px;
}

.sel_cursor {
  cursor: pointer;
  white-space: normal;
  width: 160px;
  text-align: center;
  max-height: 80px;
}
</style>
