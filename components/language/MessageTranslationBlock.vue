<template lang="pug">
  v-sheet(:style="change_status")
    Aspect.pa-0(
      :aspect="aspect"
      :ext_value.sync="value"
      @has_changed="has_changed($event)" ref="aspect"
      @aspectAction="aspectAction($event)"
      mode="edit")
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
    index: {
      type: String,
      required: true
    },
    messages: {
      type: Array,
      required: true
    },
    orig_dest_message: {
      type: String
    },
    languages: {
      type: Array,
      required: true
    },
  },
  data() {
    const value = pack_value({
      "index": pack_value(this.index),
      [this.languages[0]]: pack_value(this.messages[0]),
      [this.languages[1]]: pack_value(this.messages[1])
    })
    return {
      orig_dest_msg: this.messages[1],
      i_has_changed: false,
      value
    }
  },
  computed: {
    change_status() {
      if (this.i_has_changed) {
        return {
          "box-shadow": "-5px 0px 0px 0px #14d814"
        }
      } else {
        return {}
      }
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
        message_aspect(this.languages[0], VIEW, false),
        message_aspect(this.languages[1], EDIT, true)]

      const index_component = {
        name: "index",
        type: "str",
        attr: {max: 90, mode: VIEW},
        t_label: "comp.message_translation.index"
      }
      translation_components[1].attr["extra"] = {add_undo: true}
      if ((this.messages[0] || "").length > 40) {
        delete translation_components[1].attr["max"]
      }
      return {
        "name": "translation",
        label: "",
        "type": COMPOSITE,
        attr: {compact: true, track_change: true},
        "components": [index_component, ...translation_components]
      }
    },
    src_reference_part() {
      const src_msg = this.messages[0]
      const found_param = src_msg.match(parameter_regex)
      const found_refs = src_msg.match(reference_regex)
      const found_counts = src_msg.match(count_regex)

      if (found_param) {

      }
      if (found_refs) {
        if (found_refs[0].length === found_refs.input.length) {
          console.log("NO TRANSLATE REQ")
        }
      }
      if (found_counts) {
      }
    }
  },
  methods: {
    has_changed({name, change}) {
      this.i_has_changed = change
      this.$emit("has_changed", {name: this.index, change, value: this.messages[1]})
    },
    refresh_original() {
      this.$refs.aspect.refresh_original()
    },
    aspectAction(event) {
      console.log("asp act", event)
    }
  },
  watch: {
    value(value) {
      //this.messages[1] = value.value[this.languages[1]].value
      this.$emit("update", value.value[this.languages[1]].value)
    }
  }
}
</script>

<style scoped>

</style>
