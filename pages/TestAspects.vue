<template lang="pug">
  v-list
    v-list-item(v-for="page in pages" key="page.name" :to="page.to" nuxt)
      v-list-item-content
        v-list-item-title {{page.name}}
</template>

<script>

export default {
  name: "TestAspects",
  mixins: [],
  props: {},
  data() {
    return {
      pages: [
        {
          to: "/test/aspects/test_NumberAspect", name:"NumberAspect"
        }
      ]

    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
