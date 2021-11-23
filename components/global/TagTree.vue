<template lang="pug">
  div
    div hello
    div {{source_entry}}
    v-treeview
</template>

<script>
export default {
  name: "TagTree",
  mixins: [],
  components: {},
  props: {
    source_entry_slug: {
      type: String,
      required: true
    },
    default: () => {
    }
  },
  data() {
    return {}
  },
  computed: {
    source_entry() {
      // todo : this getter should be replaced... and actually requires a language
      return this.$store.getters["templates/code"](this.source_entry_slug)
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
