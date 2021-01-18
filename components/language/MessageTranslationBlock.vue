<template lang="pug">
  Aspect(:aspect="aspect" :ext_value.sync="translation_val")
</template>

<script>
import CompositeAspect from "~/components/aspects/CompositeAspect"
import Aspect from "~/components/Aspect"
import {COMPOSITE, EDIT, VIEW} from "~/lib/consts"
import AspectBaseMixin from "~/components/aspect_utils/AspectBaseMixin"
import {pack_value} from "~/lib/aspect"


export default {
  name: "MessageTranslationBlock",
  mixins: [AspectBaseMixin],
  components: {Aspect, CompositeAspect},
  props: {
    /*"translation": {
      type: Object,
      required: true
    }*/
  },
  data() {
    return {
      translation: {
        index: "page.h",
        translations: {
          en: "hi",
          es: null
        },
        dest_language: "es"
      }
    }
  },
  computed: {
    value() {
      return pack_value(
        Object.assign({"index": pack_value(this.translation.index)},
          this.$_.mapValues(this.translation.translations, (v) => pack_value(v)))
      )
    },
    aspect() {
      const message_aspect = (language, mode) => {
        return {
          type: "str",
          name: language,
          label: `${this.$t("lang." + language)}`,
          attr: {
            max: 90,
            mode
          }
        }
      }
      const translation_components = this.$_.map(this.translation.translations, (message, lang) =>
        message_aspect(lang, lang === this.translation.dest_language ? EDIT : VIEW))
      const index_component = {
        name: "index",
        type: "str",
        attr: {max: 90, mode: VIEW},
        t_label: "comp.message_translation.index"
      }
      return {
        "name": "translation",
        label: "",
        "type": COMPOSITE,
        attr: {compact: true},
        "components": [index_component, ...translation_components]
      }
    },
    translation_val: {
      get: function () {
        return this.value
      }, set: function (value) {
        // not sure how this magically changes: this.translation, ... well its in data
        this.translation.translations[this.translation.dest_language] = value.value[this.translation.dest_language].value
        console.log(this.translation)
      }
    }
  },
  created() {

  },
  methods: {}
}
</script>

<style scoped>

</style>
