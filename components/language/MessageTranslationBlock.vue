<template lang="pug">
  div
    Aspect(:aspect="aspect" :ext_value.sync="translation_val" @has_changed="has_changed($event)")
</template>

<script>
import CompositeAspect from "~/components/aspects/CompositeAspect"
import Aspect from "~/components/Aspect"
import {COMPOSITE, EDIT, VIEW} from "~/lib/consts"
import AspectBaseMixin from "~/components/aspect_utils/AspectBaseMixin"
import {pack_value} from "~/lib/aspect"


const parameter_regex = new RegExp("{\w*}")
const reference_regex = new RegExp("@[\\.\\w+]?:[\\w\\.]+")
const count_regex = new RegExp(".*\|.*\|.*")

export default {
  name: "MessageTranslationBlock",
  mixins: [AspectBaseMixin],
  components: {Aspect, CompositeAspect},
  props: {
    translation: { // maybe split this into: index, languages, messages, dest_language
      type: Object,
      required: true
    }
  },
  data() {
    return {
      orig_dest_msg:null,
      i_has_changed: false
    }
  },
  created() {
    this.orig_dest_msg= this.translation.messages[1]
    this.src_reference_part
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
      const message_aspect = (language, mode, track_change) => {
        return {
          type: "str",
          name: language,
          label: `${this.$t("lang." + language)}`,
          attr: {
            max: 90,
            mode,
            track_change
          }
        }
      }
      const translation_components = [
        message_aspect(this.translation.languages[0], VIEW, false),
        message_aspect(this.translation.languages[1], EDIT, true)]
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
        attr: {compact: true, track_change: true},
        "components": [index_component, ...translation_components]
      }
    },
    translation_val: {
      get: function () {
        return this.value
      }, set: function (value) {
        // not sure how this magically changes: this.translation, ... well its in data
        this.translation.messages[1] = value.value[this.translation.dest_language].value
      }
    },
    src_reference_part() {
      const src_msg = this.translation.messages[0]
      const found_param = src_msg.match(parameter_regex)
      const found_refs = src_msg.match(reference_regex)
      const found_counts = src_msg.match(count_regex)

      if(found_param){

      }
      if(found_refs) {
        if(found_refs[0].length === found_refs.input.length) {
          console.log("NO TRANSLATE REQ")
        }
      }
      if(found_counts) {
      }
    }
  },
  methods: {
    has_changed({name, change}) {
      // console.log("!!", this.translation.index, change)
      this.i_has_changed = change
    }
  }
}
</script>

<style scoped>

</style>
