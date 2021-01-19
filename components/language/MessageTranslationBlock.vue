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
    "translation": {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      // translation: {
      //   index: "page.h",
      //   messages: ["hi", null],
      //   languages: ["en", "es"],
      //   dest_language: "es"
      // }
    }
  },
  computed: {
    value() {
      const t = this.translation
      return pack_value({
        "index": pack_value(t.index),
        [t.languages[0]]: pack_value(t.messages[0]),
        [t.languages[1]]: pack_value(t.messages[1])
      })
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
      const translation_components = [
        message_aspect(this.translation.languages[0], VIEW),
        message_aspect(this.translation.languages[1], EDIT)]
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
        this.translation.messages[1] = value.value[this.translation.dest_language].value
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
