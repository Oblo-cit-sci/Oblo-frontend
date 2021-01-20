<template lang="pug">
  div.ml-2
    AspectSet(
      :aspects="setup_aspects"
      :values.sync="setup_values"
      mode="edit"
      @is_complete="setup_is_complete = $event"
      :include_validation="true")
    v-btn(@click="init" :disabled="!setup_is_complete" color="success") {{$t("comp.translate.start")}}
</template>

<script>

import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import Aspect from "~/components/Aspect";
import {extract_n_unpack_values, pack_value} from "~/lib/aspect";
import {SELECT, UI_LANGUAGE} from "~/lib/consts";
import AspectSet from "~/components/AspectSet";

const components = ["fe", "be"]

export default {
  name: "TranslateSetupComponent",
  components: {AspectSet, Aspect},
  mixins: [OptionsMixin],
  data() {
    return {
      setup_values: {
        component: pack_value(),
        src_lang: pack_value(this.$store.getters["user/settings_value"](UI_LANGUAGE)),
        dest_lang: pack_value()
      },
      setup_is_complete: false
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
    }
  }
}
</script>

<style scoped>

</style>
