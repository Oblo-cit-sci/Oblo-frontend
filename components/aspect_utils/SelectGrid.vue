<template lang="pug">
  div
    div.d-flex.flex-wrap
      .cell(v-for="(c, i) in options" :key="i" :style="cell_style"
        :class="{cell_border: cell_border, cell_selected: is_selected(i)}")
        v-container.pt-1
          v-row.mt-1.mb-1.justify-center
            v-img.sel_cursor(v-if="c.icon" @click="select(c,'img')" :src="get_icon_url(c.icon)" :style="img_style" contain)
          v-row.mt-2.mb-2.justify-center
            div.sel_cursor.px-1(@click="select(c,'text')" :style="text_size(c)") {{c.text}}
</template>

<script>
import SelectComponentMixin from "~/components/aspect_utils/SelectComponentMixin"
import ResponsivenessMixin from "~/components/ResponsivenessMixin"
import SingleSelectMixin from "~/components/aspects/SingleSelectMixin"

export default {
  name: "SelectGrid",
  mixins: [SelectComponentMixin, SingleSelectMixin, ResponsivenessMixin],
  components: {},
  props: {
    options: Array, // of objects: text, value, icon (url)
    default_image_url: String,
    max_cell_width: {
      type: Number
    },
    cell_border: {
      type: Boolean,
      default: true
    }
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
        "max-width": (this.is_xsmall ? 90 : this.is_small ? 120 : 160) + "px"
      }
    },
    img_style() {
      const sz = (this.is_xsmall ? 60 : this.is_small ? 70 : 80) + "%"
      return {
        "width": sz,
        "max-width": sz,
        "max-height": sz
      }
    }
  },
  methods: {
    select(value, src) {
      console.log("SelectGrid", value, src)
      // console.trace()
      if (value.value === this.selection.value) {
        console.log("emit null")
        this.$emit("selection", null)
      } else {
        this.$emit("selection", value)
      }
    },
    text_size(item) {
      let resp_size = (this.is_xsmall ? 80 : this.is_small ? 90 : 100)
      if (item.text.length > 60) {
        resp_size *= 0.9
      }
      return {'font-size': resp_size + "%"}
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

.cell_border {
  border: 1px grey solid;
}

.cell_selected {
  background: khaki;
}
</style>
