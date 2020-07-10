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

  export default {
    name: "LanguageSelector",
    mixins: [],
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
          // console.log("lang get", this.$store.getters["app/ui_language"] || "en")
          return this.$store.getters["app/ui_language"] || "en"
        },
        set: function (lang) {
          this.$store.commit("app/ui_language", lang)
        }
      },
      label() {
        return this.$t("comp.language_select.label")
      }
    },
    watch: {
      language(lang) {
        this._i18n.locale = lang
        if (this.$store.getters[USER_LOGGED_IN]) {
          // console.log(this.$store.getters["user/settings"]["ui_language"], lang)
          if (this.$store.getters["user/settings"]["ui_language"] !== lang) {
            this.$api.post_actor__me({settings: {ui_language: lang}})
          }
        } else {
          this.$api.axios.defaults.headers.common["Content-Language"] = lang + "-" + lang.toUpperCase()
        }
      }
    }
  }
</script>

<style scoped>

</style>
