<template lang="pug">
  div.mt-8.my-2.px-3
    v-select(
      v-if="has_multiple_languages"
      flat
      :items="available_languages"
      :disabled="is_disabled"
      prepend-icon="mdi-translate"
      v-model="language"
      hide-details
      :label="$t('comp.language_select.label')")
    div.mt-2(v-if="is_disabled") {{$t("comp.language_select.change_not_possible")}}
</template>

<script>
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {EDIT, UI_LANGUAGE} from "~/lib/consts"
import LanguageMixin from "~/components/LanguageMixin";
import {PAGE_ENTRY} from "~/lib/pages";
import URLQueryMixin from "~/components/util/URLQueryMixin";
import {create_option} from "~/lib/options";

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
  components: {},
  props: {},
  data() {
    return {}
  },
  mounted() {
    if (!this.language) {
      this.language = navigator.language.split("-")[0]
    }
  },
  computed: {
    has_multiple_languages() {
      return this.available_languages.length > 1
    },
    // message() {
    //   if (this.is_disabled) {
    //     return "You cannot change the language during entry creation"
    //   }
    // },
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
      return (this.$route.name === PAGE_ENTRY && this.entry_mode === EDIT)
    },
    language: {
      get: function () {
        return this.setting(UI_LANGUAGE)
      },
      set: function (language) {
        // console.log(language)
        const available_languages_codes = this.$store.getters["available_languages"]
        if (available_languages_codes.includes(language)) {
          this.change_language(language)
        } else {
          this.change_language(this.setting(UI_LANGUAGE), true, language, true)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
