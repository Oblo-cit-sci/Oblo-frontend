<template lang="pug">
  v-expansion-panels(flat)
    v-expansion-panel
      v-expansion-panel-header {{title}}
      v-expansion-panel-content
        div
          div(v-for="(text, index) in content_texts" :key="index") {{text}}
</template>

<script>
export default {
  name: "SimpleExpansionPanel",
  mixins: [],
  components: {},
  props: {
    title: String,
    content_texts: Array
  },
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
