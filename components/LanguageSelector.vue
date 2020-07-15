<template lang="pug">
  v-select.mt-8.my-2.px-3(
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

  export default {
    name: "LanguageSelector",
    mixins: [SettingsChangeMixin],
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
      available_languages() {
        // todo should come from the server
        const available_languages = ["en", "es"] //["en", "de", "es", "fr"]
        return available_languages.map(l => ({
          "value": l,
          "text": (this.$t("lang." + l))
        }))
      },
      language: {
        get: function () {
          return this.setting(UI_LANGUAGE)
        },
        set: function (lang) {
          this.set_settings_value(UI_LANGUAGE, lang)
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
