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
import {USER_LOGGED_IN} from "~/store/user"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {UI_LANGUAGE} from "~/lib/consts"
import InitializationMixin from "~/layouts/InitializationMixin"

export default {
  name: "LanguageSelector",
  mixins: [SettingsChangeMixin, InitializationMixin],
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
      set: function (language) {
        let domain = this.$store.getters["domain"].name // undefined for non-domain

        // todo maybe can go into a mixin, if there are other settings for the language
        this.complete_language_domains(domain, language).then(() => {
          this.set_settings_value(UI_LANGUAGE, language)
        })

      }
    },
    label() {
      return this.$t("comp.language_select.label")
    }
  },
  watch: {
    language(lang) {
      this._i18n.locale = lang
      if (!this.$store.getters[USER_LOGGED_IN]) {
        this.$api.axios.defaults.headers.common["Content-Language"] = lang + "-" + lang.toUpperCase()
      }
    }
  }
}
</script>

<style scoped>

</style>
