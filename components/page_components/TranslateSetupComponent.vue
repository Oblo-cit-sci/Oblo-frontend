<template lang="pug">
  div.ml-2
    AspectSet(
      :aspects="setup_aspects"
      :values.sync="setup_values"
      mode="edit"
      @is_complete="setup_is_complete = $event"
      :include_validation="true")
      template(v-slot:pre_validation)
        v-btn(@click="new_lang") {{$t("comp.translate.new.new_lang")}}
    v-btn(@click="init" :disabled="!setup_is_complete" color="success") {{$t("comp.translate.start")}}
    Dialog(:dialog_open.sync="new_lang_dialog_open")
      h3 {{$t("comp.translate.new.descr")}}
      LanguageSearch(v-model="new_language")
      v-btn(@click="add_language" :disabled="!new_language" color="success") {{$t("comp.translate.start")}}
      p.mt-2 {{$t("comp.translate.new.get_in_touch")}}
</template>

<script>

import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import Aspect from "~/components/Aspect";
import {extract_n_unpack_values, pack_value} from "~/lib/aspect";
import {SELECT, UI_LANGUAGE} from "~/lib/consts";
import AspectSet from "~/components/AspectSet";
import LanguageSearch from "~/components/language/LanguageSearch";
import Dialog from "~/components/dialogs/Dialog";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

const components = ["fe", "be"]

export default {
  name: "TranslateSetupComponent",
  components: {Dialog, LanguageSearch, AspectSet, Aspect},
  mixins: [OptionsMixin, TriggerSnackbarMixin],
  data() {
    const {component, src_lang, dest_lang} = this.$store.getters["translate/translation"]
    return {
      setup_values: {
        component: pack_value(component),
        src_lang: pack_value(src_lang || this.$store.getters["user/settings_value"](UI_LANGUAGE)),
        dest_lang: pack_value(dest_lang)
      },
      setup_is_complete: false,
      new_lang_dialog_open:false,
      new_language: null
    }
  },
  computed: {
    available_components_options() {
      return components.map(c => this.create_option(c, this.$t("comp.translate.component_select_asp.options." + c)))
    },
    component_select_aspect() {
      return {
        name: "component",
        type: SELECT,
        attr: {},
        label: this.$t("comp.translate.component_select_asp.label"),
        description: this.$t("comp.translate.component_select_asp.description"),
        items: this.available_components_options
      }
    },
    language_select_aspect() {
      return {
        type: SELECT,
        items: this.available_languages_options
      }
    },
    src_language_select_aspect() {
      const base = "comp.translate.src_lang."
      return Object.assign(this.$_.cloneDeep(this.language_select_aspect), {
        name: "src_lang",
        label: this.$t(`${base}label`),
        description: this.$t(`${base}descr`),
      })
    },
    dest_language_select_aspect() {
      const base = "comp.translate.dest_lang."
      return Object.assign(this.$_.cloneDeep(this.language_select_aspect), {
        name: "dest_lang",
        label: this.$t(`${base}label`),
        description: this.$t(`${base}descr`),
      })
    },
    available_languages_options() {
      const m = this.$i18n.messages[this.$i18n.fallbackLocale].lang
      return this.$_.map(m, (l_code, language_name) => this.create_option(language_name, l_code))
    },
    setup_aspects() {
      return [this.component_select_aspect, this.src_language_select_aspect, this.dest_language_select_aspect]
    },
    disable_init() {
      return true
    }
  },
  methods: {
    async init() {
      const {component, src_lang, dest_lang} = extract_n_unpack_values(this.setup_values)
      const {data} = await this.$api.language.get_component(component, [src_lang, dest_lang], false)
      await this.$store.dispatch("translate/setup", {component, src_lang, dest_lang, messages: data})
      await this.$router.push("/translate/translate")
    },
    new_lang() {
      this.new_lang_dialog_open = true
    },
    add_language() {
      console.log(this.new_language)
      this.$api.language.add_language(this.new_language).then(res => {

      }, err => {
          this.err_error_snackbar(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
