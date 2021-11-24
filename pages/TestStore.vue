<template lang="pug">
  v-list
    v-list-item(v-for="page in pages" :key="page.name" :to="page.to" nuxt)
      v-list-item-content
        v-list-item-title {{page.name}}
</template>

<script>

export default {
  name: "teststore",
  mixins: [],
  props: {},
  data() {
    const base_path = "/test/store/test_"
    const store_module = ["template"]
    const pages = store_module.map(module => {
      return {
        name: module,
        to: base_path + module
      }
    })
    return {
      pages
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
