<template lang="pug">
  div
    v-row(align="center" justify="center" v-for="section in text_sections" :key="section.h")
      v-col.col-lg-6.col-xs-12
        component(:is="section_heading_elem(section)") {{section_heading(section)}}
        p(v-for="(paragraph,index) in section.p" :key="index") {{paragraph}}
        div(v-if="section.html" v-html="section.html")
        v-divider.wide_divider(v-if="section_heading_elem(section) === 'h2'")
    Footer
</template>

<script>
  import goToMiddleware from "~/components/global/goToMiddleware"
  import Footer from "~/components/global/Footer"



  export default {
    name: "about",
    components: {Footer},
    mixins: [goToMiddleware],
    computed: {
      text_sections() {
        return this.$t("about2")
      }
    },
    methods: {
      section_heading_elem(section) {
        for (let i in [...Array(4).keys()]) {
          const ht = "h"+i
          if (section.hasOwnProperty(ht)) {
            return ht
          }
        }
      },
      section_heading(selection) {
        return selection[this.section_heading_elem(selection)]
      }
    }
  }
</script>

<style scoped>

</style>
