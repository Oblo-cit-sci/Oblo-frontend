<template lang="pug">
  v-tooltip(bottom v-if="tag.hover" color="rgba(0,0,0,0.9)" open-delay="150")
    template(v-slot:activator="{ on, attrs }")
      v-chip.mr-1(class="custom-chip"  outlined  v-bind="attrs" v-on="on") {{tag.text}}
    div(v-html="hover_content")
  v-chip.mr-1(v-else class="custom-chip"  outlined)
    v-avatar(left v-if="has_icon")
      v-img(src="")
    span {{tag.text}}
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
  computed: {
    hover_content() {
      if(typeof this.tag.hover === "string") {
        return this.tag.hover
      } else {
        return this.tag.hover.map(e => `<div>${e}</div>`).join("")
      }
    },
    has_icon() {
      return false
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
