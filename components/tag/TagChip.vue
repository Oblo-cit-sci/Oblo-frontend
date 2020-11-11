<template lang="pug">
  v-tooltip(bottom v-if="!tag.summary && tag.hover")
    template(v-slot:activator="{ on, attrs }")
      v-chip.mr-1(class="custom-chip"  outlined  v-bind="attrs" v-on="on") {{tag.text}}
    span {{tag.hover}}
  v-chip.mr-1(v-else class="custom-chip"  outlined) {{tag.text}}
</template>

<script>
export default {
  name: "TagChip",
  mixins: [],
  components: {},
  props: {
    tag: {
      type: Object,
      required: true
    }
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
