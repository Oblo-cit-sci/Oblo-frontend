<template lang="pug">
  div.ml-4
    Aspect(v-for="aspect in shown_aspects"
      :key="aspect.name"
      :aspect="aspect"
      mode="view")
</template>

<script>
import EntryMixin from "../components/entry/EntryMixin";

export default {
      name: "Codes",
      mixins: [EntryMixin],
      components: {},
      props: {

      },
      data() {
          return {
              entry: null
          }
      },
      created() {
      },
      computed: {

      },
      methods: {

      },
      watch: {

      }
}
</script>

<style scoped>

</style>
