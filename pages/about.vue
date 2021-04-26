<template lang="pug">
  div
    v-row(align="center" justify="center")
      v-col.col-lg-6.col-xs-12
        LanguageChip(v-if="language_fallback" :language_code="$i18n.fallbackLocale")
    v-row(align="center" justify="center" v-for="section in text_sections" :key="section.h")
      v-col.col-lg-6.col-xs-12
        FlexibleTextSection(:section="section" :fields="template_fields")
    p(class="package-version") version {{version}}
    Footer
</template>

<script>
import GoToMixin from "~/components/global/GoToMixin"
import Footer from "~/components/global/Footer"
import FlexibleTextSection from "~/components/global/FlexibleTextSection"
import {NO_DOMAIN} from "~/lib/consts";
import LanguageChip from "~/components/language/LanguageChip";
import URLQueryMixin from "~/components/util/URLQueryMixin";
import NavBaseMixin from "~/components/NavBaseMixin";

const pkg = require('~/package.json')

export default {
  name: "about",
  components: {LanguageChip, FlexibleTextSection, Footer},
  mixins: [GoToMixin, URLQueryMixin, NavBaseMixin],
  data() {
    return {
      language_fallback: false
    }
  },
  computed: {
    text_sections() {
      // get sections from the fe-component
      let sections = this.$t("page.about")
      if (!sections[0].h2) { // todo make a better detection if it exists in the lang
        sections = this.$i18n.getLocaleMessage(this.$i18n.fallbackLocale).page.about
        this.language_fallback = true
      } else {
        this.language_fallback = false
      }

      // from the fe, we dont get an array but an object, with indices as keys... :/
      if (!Array.isArray(sections)) {
        sections = this.$_.times(Object.keys(sections).length, i => sections[i])
      }
      sections = this.$_.concat(this.about_domain, sections)
      return sections
    },
    about_domain() {
      let act_lang_domain_data = null
      if (this.query_param_domain_name) {
        act_lang_domain_data = act_lang_domain_data = this.$store.getters["domain/lang_domain_data"]
        (this.query_param_domain_name, this.$store.getters.ui_language)
      } else {
        act_lang_domain_data = this.$store.getters["domain/act_lang_domain_data"]
      }
      if (!act_lang_domain_data) {
        this.home()
        return
      }
      let domain_about = act_lang_domain_data.about
      // console.log(domain_about)
      if (!domain_about) {
        const domain_name = act_lang_domain_data.name
        domain_about = this.$store.getters["domain/get_domain_default_lang_data"](domain_name).about
        // console.log(this.domain_name, domain_about)
      }
      return domain_about
      // console.log(domain_about)
    },
    version() {
      return pkg.version
    },
    template_fields() {
      return {
        platform_title: this.$store.getters["app/platform_data"].title
      }
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
