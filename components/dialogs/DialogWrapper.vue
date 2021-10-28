<template lang="pug">
  v-dialog(v-model="dialog_open" :width="width" :style="{'overflow-x':'hidden'}")
    v-sheet.pa-2(:color="color")
      slot
</template>

<script>
export default {
  name: "DialogWrapper",
  mixins: [],
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
