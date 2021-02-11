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
import {NO_DOMAIN} from "~/lib/consts";

const pkg = require('~/package.json')


export default {
  name: "about",
  components: {FlexibleTextSection, Footer},
  mixins: [GoToMixin],
  computed: {
    text_sections() {
      let sections = this.$t("page.about")
      if (!Array.isArray(sections)) {
        const le = Object.keys(sections).length
        const sections_arr = []
        for (let i = 0; i < le; i++) {
          sections_arr.push(sections[i])
        }
        sections = sections_arr
      }
      if (this.is_concrete_domain) {
        sections.splice(2, 0, this.about_domain)
      }
      return sections
    },
    is_concrete_domain() {
      return this.$store.getters["domain/act_domain_name"] !== NO_DOMAIN
    },
    about_domain() {
      const act_lang_domain_data = this.$store.getters["domain/act_lang_domain_data"]
      return {h2: act_lang_domain_data.title, html: act_lang_domain_data.about}
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
