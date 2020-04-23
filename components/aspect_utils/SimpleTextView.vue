<template lang="pug">
  div
    div(v-for="(part, index) in text_parts")
      span {{part_title(part)}}: &nbsp;
      span(v-if="is_string(part)") {{part_val(part)}}
      span(v-else-if="is_array(part)") {{join_array(part)}}
</template>

<script>
  import AspectComponentMixin from "~/components/aspects/AspectComponentMixin"

  export default {
    name: "SimpleTextView",
    mixins: [AspectComponentMixin],
    components: {},
    props: {},
    data() {
      return {}
    },
    computed: {
      text_parts() {
        return this.value
      }
    },
    methods: {
      is_string(part) {
        return typeof Object.values(part)[0] === "string"
      },
      is_array(part) {
        return Array.isArray(Object.values(part)[0])
      },
      part_title(part) {
        return Object.keys(part)[0]
      },
      part_val(part) {
        return Object.values(part)[0]
      },
      join_array(part) {
        return (Object.values(part)[0]).join("; ")
      }
    }
  }
</script>

<style scoped>

</style>
