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

const pkg = require('~/package.json')

export default {
  name: "about",
  components: {LanguageChip, FlexibleTextSection, Footer},
  mixins: [GoToMixin, URLQueryMixin],
  data() {
    return {
      language_fallback: false
    }
  },
  computed: {
    text_sections() {
      let sections = this.$t("page.about")
      if (!sections[0].h1) {
        sections = this.$i18n.getLocaleMessage(this.$i18n.fallbackLocale).page.about
        this.language_fallback = true
      } else {
        this.language_fallback = false
      }
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
      return this.$store.getters["domain/act_domain_name"] !== NO_DOMAIN || this.query_param_domain_name !== undefined
    },
    about_domain() {
      let act_lang_domain_data = this.$store.getters["domain/act_lang_domain_data"]
      if (this.query_param_domain_name !== NO_DOMAIN && this.query_param_domain_name) {
        act_lang_domain_data = this.$store.getters["domain/lang_domain_data"]
        (this.query_param_domain_name, this.$store.getters.ui_language)
      }
      // console.log("act_lang_domain_data", act_lang_domain_data)
      return {h2: act_lang_domain_data.title, html: act_lang_domain_data.about}
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
