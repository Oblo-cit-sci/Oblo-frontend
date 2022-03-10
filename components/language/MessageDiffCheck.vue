<template lang="pug">
  v-sheet(:style="change_status")
    Aspect.pa-0(
      :aspect="aspect"
      :ext_value.sync="value"
      @has_changed="has_changed($event)" ref="aspect"
      mode="edit")
</template>

<script>
import CompositeAspect from "~/components/aspects/CompositeAspect"
import Aspect from "~/components/Aspect"
import {COMPOSITE, EDIT, SELECT, STR, VIEW} from "~/lib/consts"
import AspectBaseMixin from "~/components/aspect_utils/AspectBaseMixin"
import {pack_value} from "~/lib/aspect"
import LanguageMixin from "~/components/LanguageMixin"


const parameter_regex = new RegExp("{\w*}")
const reference_regex = new RegExp("@[\\.\\w+]?:[\\w\\.]+")
const count_regex = new RegExp(".*\|.*\|.*")

export default {
  name: "MessageDiffCheck",
  mixins: [AspectBaseMixin, LanguageMixin],
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
      "select_msg": {value: "v1", text: this.messages[1]}
    })
    return {
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
      return {
        name: "translation",
        label: "",
        "type": COMPOSITE,
        attr: {compact: true, track_change: true},
        "components": [{
          name: "index",
          type: STR,
          attr: {max: 90, mode: VIEW, columns: 2},
          t_label: "comp.message_translation.index"
        }, {
          type: STR,
          name: this.languages[0],
          label: this.t_lang(this.languages[0]),
          attr: {
            max: 90,
            mode: VIEW,
            columns: 5
          }
        },
          {
            name: "select_msg",
            type: SELECT,
            label: "",
            items: [
              {
                value: "v1",
                text: this.messages[1]
              },
              {
                value: "v2",
                text: this.orig_dest_message
              }
            ]
          }]
      }
    }
  },
  methods: {
    has_changed({name, change}) {
      this.i_has_changed = change
      this.$emit("has_changed", {name: this.index, change, value: this.messages[1]})
    }
  },
  watch: {
    value(value) {
      this.$emit("update", value.value.select_msg.text)
    }
  }
}
</script>

<style scoped>

</style>
