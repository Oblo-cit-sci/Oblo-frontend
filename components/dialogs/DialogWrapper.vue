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
    return {
      dialog_open: false
    }
  },
  computed: {},
  methods: {
    // close() {
    //   console.log("click_outside")
    // },
    // click_outside() {
    //   console.log("click outside")
    // }
  },
  watch: {
    value(open) {
      console.log("DialogWrapper.value", open)
      this.dialog_open = open
    },
    dialog_open(open) {
      console.log("DialogWrapper.dialog_open", open)
      this.$emit("input", open)
    }
  }
}
</script>

<style scoped>

</style>
