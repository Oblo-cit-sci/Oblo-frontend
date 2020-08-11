<template lang="pug">
  div
    v-row(align="center" justify="center" v-for="section in text_sections" :key="section.h")
      v-col.col-lg-6.col-xs-12
        FlexibleTextSection(:section="section")
    p(class="package-version") version {{version}}
    Footer
</template>

<script>
import GoToMixin from "~/components/global/GoToMixin"
import Footer from "~/components/global/Footer"
import FlexibleTextSection from "~/components/global/FlexibleTextSection"

const pkg = require('~/package.json')

export default {
  name: "about",
  components: {FlexibleTextSection, Footer},
  mixins: [GoToMixin],
  computed: {
    text_sections() {
      return this.$t("about")
    },
    version() {
      return pkg.version
    }
  }
}
</script>

<style scoped>
.package-version {
  color: rgb(109, 109, 109);
  font-size: 14px;
}
</style>
