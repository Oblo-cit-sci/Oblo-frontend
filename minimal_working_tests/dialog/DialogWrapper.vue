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
    persistent: Boolean
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
