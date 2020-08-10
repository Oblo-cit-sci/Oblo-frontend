<template lang="pug">
  div
    v-row(align="center" justify="center" v-for="section in text_sections" :key="section.h")
      v-col.col-lg-6.col-xs-12
        FlexibleTextSection(:section="section")
    Footer
</template>

<script>
  import GoToMixin from "~/components/global/GoToMixin"
  import Footer from "~/components/global/Footer"
  import FlexibleTextSection from "~/components/global/FlexibleTextSection"

  export default {
    name: "about",
    components: {FlexibleTextSection, Footer},
    mixins: [GoToMixin],
    computed: {
      text_sections() {
        return this.$t("about")
      }
    }
  }
</script>

<style scoped>

</style>
