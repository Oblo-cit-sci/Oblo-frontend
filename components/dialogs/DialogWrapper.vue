<template lang="pug">
  v-dialog(v-model="dialog_open" :style="dialogStyle")
    v-sheet.pa-2(:color="color")
      slot
</template>

<script>
import LayoutMixin from "~/components/global/LayoutMixin"

export default {
  name: "DialogWrapper",
  mixins: [LayoutMixin],
  components: {},
  props: {
    value: {
      type: Boolean,
      default: false
    },
    persistent: Boolean,
    color: {
      type: String,
      default: "white"
    },
    width: Number,
    fix_width: Number
  },
  data() {
    return {}
  },
  computed: {
    dialog_open: {
      set(open) {
        this.$emit("input", open)
      },
      get() {
        return this.value
      }
    },
    dialogStyle() {
      const default_style = this.main_container_width_style
      // todo doesnt work
      default_style["overflow-x"] = 'hidden'
      return default_style
    }
  },
  methods: {
    // close() {
    //   console.log("click_outside")
    // },
    // click_outside() {
    //   console.log("click outside")
    // }
  },
  watch: {}
}
</script>

<style scoped>

</style>
