<template lang="pug">
  div
    Aspect(:aspect="aspect" :ext_value="val" mode="edit" @has_changed="has_changed($event)")
    div {{CC.change}}
    Aspect(:aspect="test" :ext_value.sync="text" mode="edit")
    MessageTranslationBlock(v-bind="translate_data")
</template>

<script>


import Aspect from "~/components/Aspect"
import {aspect_default_value, pack_value, unpack} from "~/lib/aspect";
import MessageTranslationBlock from "~/components/language/MessageTranslationBlock";

export default {
  name: "Tests",
  mixins: [],
  components: {
    MessageTranslationBlock,
    Aspect
  },
  created() {

  },
  data() {
    const aspect = {
      "name": "translation",
      "label": "",
      "type": "composite",
      "attr": {"compact": true, "track_change": true},
      "components": [{
        "name": "index",
        "type": "str",
        "attr": {"max": 90, "mode": "view"},
        "t_label": "comp.message_translation.index"
      }, {
        "type": "str",
        "name": "en",
        "label": "english",
        "attr": {"max": 90, "mode": "view", "track_change": false}
      }, {"type": "str", "name": "de", "label": "german", "attr": {"max": 90, "mode": "edit", "track_change": true}}]
    }
    return {
      translate_data: {
        index:"ok",
        languages: ["en","de"],
        messages: ["ok",""]
      },
      val: aspect_default_value(aspect),
      aspect,
      text: pack_value(""),
      CC: {},
      test: {
        name: "a",
        type: "str",
        attr: {max: 90}
      }
    }
  },
  computed: {},
  methods: {
    has_changed(event) {
      console.log(event)
      this.CC = event
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
