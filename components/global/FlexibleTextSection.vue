<template lang="pug">
  div
    component(:is="section_heading_elem(section)") {{render(section_heading(section))}}
    p(v-for="(paragraph,index) in section.p" :key="index") {{render(paragraph)}}
    div(v-if="section.html" v-html="section.html")
    v-divider.wide_divider(v-if="show_divider")
</template>

<script>

const Mustache = require("mustache")

export default {
  name: "FlexibleTextSection",
  mixins: [],
  components: {},
  props: {
    section: {
      type: Object,
      required: true
    },
    disable_divider: {
      type: Boolean,
      default: true
    },
    // replace fields with mustache
    fields: {
      type: Object
    }
  },
  data() {
    return {}
  },
  computed: {
    show_divider() {
      return this.section_heading_elem(this.section) === 'h2' && this.section.p && !this.disable_divider
    }
  },
  methods: {
    section_heading_elem(section) {
      for (let i in [...Array(4).keys()]) {
        const ht = "h" + i
        if (section.hasOwnProperty(ht)) {
          return ht
        }
      }
    },
    section_heading(selection) {
      return selection[this.section_heading_elem(selection)]
    },
    render(paragraph) {
      return Mustache.render(paragraph, this.fields)
    }
  }

}
</script>

<style scoped>

</style>
