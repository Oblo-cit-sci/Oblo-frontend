<template lang="pug">
  v-select.mt-8.my-2.px-3(
    v-if="has_multiple_languages"
    dense flat
    :items="available_languages"
    prepend-icon="mdi-translate"
    v-model="language"
    hide-details
    :label="label")
</template>

<script>
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {DOMAIN_LANGUAGE, UI_LANGUAGE} from "~/lib/consts"
import LanguageMixin from "~/components/LanguageMixin";

export default {
  name: "LanguageSelector",
  mixins: [SettingsChangeMixin, LanguageMixin],
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
    loaded_ui_languages() {
      return Object.keys(this.$i18n.messages)
    },
    available_languages() {
      // todo when on domain page only take
      const available_languages = this.$store.getters["available_languages"]
      return available_languages.map(l => ({
        "value": l,
        "text": (this.$t("lang." + l))
      }))
    },
    language: {
      get: function () {
        return this.setting(UI_LANGUAGE)
      },
      set: async function (language) {
        let domain = this.$store.getters["domain/act_domain_name"] // undefined for non-domain
        // todo maybe can go into a mixin, if there are other settings for the language
        this.complete_language_domains(domain, language).then(() => {
          this.set_settings_value(DOMAIN_LANGUAGE, language)
        })
        try {
          if(!this.loaded_ui_languages.includes(language)) {
            const {data} = await this.$api.language.get_component("fe", language)
            this.$i18n.setLocaleMessage(language, data)
          }
          this.$api.axios.defaults.headers.common["Accept-Language"] = language
          this.set_settings_value(UI_LANGUAGE, language)
          this._i18n.locale = language
        } catch (e) {
          if (e.response.status === 404) {
            console.log("frontend not available in the language:", language)
          }
        }

      }
    },
    label() {
      return this.$t("comp.language_select.label")
    }
  },
  watch: {
    language(lang) {
      console.log("w", lang)
      // this._i18n.locale = lang
      //
      // if (!this.$store.getters["user/logged_in"]) {
      //   this.$api.axios.defaults.headers.common["Content-Language"] = lang + "-" + lang.toUpperCase()
      // }
    }
  }
}
</script>

<style scoped>

</style>
