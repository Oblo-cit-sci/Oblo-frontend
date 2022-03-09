<template lang="pug">
  div.my-2.px-3
    v-select.mt-4(
      v-if="has_multiple_languages && !is_disabled"
      flat
      :items="available_languages"
      :disabled="is_disabled"
      prepend-icon="mdi-translate"
      v-model="language"
      hide-details
      :label="$t('comp.language_select.label')")
    div(v-if="is_disabled" :style="{'font-size':'80%'}")
      div.mr-2(:style="{float:'left'}")
        v-icon.mt-2 mdi-translate
      span.my-auto {{$t("comp.language_select.change_not_possible")}}
</template>

<script>
import {DOMAIN_LANGUAGE, EDIT, UI_LANGUAGE} from "~/lib/consts"
import LanguageMixin from "~/components/LanguageMixin";
import {PAGE_DOMAIN, PAGE_ENTRY, PAGE_PROFILE} from "~/lib/pages";
import URLQueryMixin from "~/components/util/URLQueryMixin";
import {create_option} from "~/lib/options";
import {is_editable_mode} from "~/lib/aspect"

/**
 * TODO.
 * language can not be changed during entry creation.
 * tried global-dialog: :value/@input props on v-select but its internal value, will still change,
 * even if caught in the computed methods.
 * also hints should be shown, but arent :/
 * not it just disables without any user-feedback
 */
export default {
  name: "LanguageSelector",
  mixins: [LanguageMixin, URLQueryMixin],
  mounted() {
    if (!this.language) {
      // console.log("LanguageSelector-mounted without language")
      this.language = navigator.language.split("-")[0]
    }
  },
  computed: {
    has_multiple_languages() {
      return this.available_languages.length > 1
    },
    available_languages() {
      const available_languages_codes = this.$store.getters["available_languages"]
      let available_languages = available_languages_codes.map(l => create_option(l, this.$t("lang." + l)))
      if (this.$store.getters["domain/is_concrete_domain"]) {
        const domain_languages = this.$store.getters["domain/get_domain_languages"](this.$store.getters["domain/act_domain_name"])
        for (const domain_lang of domain_languages) {
          if (!available_languages_codes.includes(domain_lang)) {
            available_languages.push(create_option(domain_lang, `${this.$t("lang." + domain_lang)} (domain)`))
          }
        }
      }
      return available_languages
    },
    is_disabled() {
      return (this.$route.name === PAGE_ENTRY && is_editable_mode(this.entry_mode)) ||
        (this.$route.name === PAGE_PROFILE)
    },
    language: {
      get: function () {
      // console.log("LanguageSelector-gettings language", this.setting(DOMAIN_LANGUAGE), this.setting(UI_LANGUAGE))
        if (this.$route.name === PAGE_DOMAIN) {
          return this.setting(DOMAIN_LANGUAGE)
        } else {
          return this.setting(UI_LANGUAGE)
        }
      },
      set: async function (language) {
        // console.log(language)
        const available_languages_codes = this.$store.getters["available_languages"]
        await this.get_domain_overviews(language)
        if (available_languages_codes.includes(language)) {
          await this.change_language(language)
        } else {
          await this.change_domain_language(language, true, true)
          // this.change_language(this.setting(UI_LANGUAGE), true, language, true)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
