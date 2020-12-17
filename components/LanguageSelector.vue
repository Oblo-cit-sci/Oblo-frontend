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
        await this.change_language(language)
      }
    },
    label() {
      return this.$t("comp.language_select.label")
    }
  }
}
</script>

<style scoped>

</style>
