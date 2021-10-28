<template lang="pug">
  v-dialog(v-model="dialog_open" :persistent="persistent")
    v-sheet
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
    }
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
  }
}
</script>

<style scoped>

</style>
