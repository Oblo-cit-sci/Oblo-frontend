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
  mixins: [SettingsChangeMixin, LanguageMixin, URLQueryMixin],
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
      // todo when on domain page only take
      const available_languages = this.$store.getters["available_languages"]
      return available_languages.map(l => create_option(l, this.$t("lang." + l)))
    },
    is_disabled() {
      return (this.$route.name === PAGE_ENTRY && this.entry_mode === EDIT)
    },
    language: {
      get: function () {
        return this.setting(UI_LANGUAGE)
      },
      set: function (language) {
        this.change_language(language)
      }
    }
  }
}
</script>

<style scoped>

</style>
