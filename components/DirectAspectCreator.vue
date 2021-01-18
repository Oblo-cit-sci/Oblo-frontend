<template lang="pug">
  div
    v-select(:items="templates" @change="select_template($event)") templates
    v-textarea(v-model="input" outlined)
    div(v-if="error") {{error}}
    v-btn(@click="generate") gen
    v-switch(v-model="mode" :label="mode.toString()" false-value="view" true-value="edit")
    Aspect(:aspect="aspect" :ext_value.sync="value" :mode="mode")
    Aspect(v-if="show_view" :aspect="aspect" :ext_value="value")
    v-btn(@click="add_aspect") add
    AspectSet(:aspects="aspects" mode="edit")
</template>

<script>
import Aspect from "~/components/Aspect"
import {pack_value} from "~/lib/aspect"
import AspectBaseMixin from "~/components/aspect_utils/AspectBaseMixin"
import {EDIT, VIEW} from "~/lib/consts"
import AspectSet from "~/components/AspectSet"

export default {
  name: "DirectAspectCreator",
  mixins: [AspectBaseMixin],
  components: {AspectSet, Aspect},
  props: {},
  data() {
    return {
      templates: [
        {
          "text": "short string",
          "value": {
            type: "str",
            name: "random"
          }
        }
      ],
      input: "",
      mode: VIEW,
      aspect: {},
      value: pack_value(),
      error: null,
      aspects: []
    }
  },
  computed: {
    show_view() {
      return this.mode === EDIT && this.value !== this.default_value()
    }
  },
  methods: {
    select_template(selection) {
      this.input = JSON.stringify(selection)
      this.generate()
    },
    generate() {
      try {
        this.aspect = JSON.parse(this.input)
        this.value = this.default_value()
        this.error = null
      } catch (e) {
        this.error = e
      }
    },
    add_aspect() {
      this.aspects.push(this.aspect)
    }
  }
}
</script>

<style scoped>

</style>
