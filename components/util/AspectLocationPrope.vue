<template lang="pug">
  div
    v-text-field(v-model="input" outlined single-line)
    v-btn(@click="gen_out") check
    div {{output}}
</template>

<script>
import {aspect_loc_str2arr, loc_prepend} from "~/lib/aspect"
import {EDIT} from "~/lib/consts"
import {direct_select, select_aspect_loc} from "~/lib/entry"

export default {
  name: "AspectLocationPrope",
  mixins: [],
  components: {},
  props: {
    uuid: {
      type: String
    }
  },
  data() {
    return {
      input: "",
      output: null
    }
  },
  computed: {
  },
  methods: {
    gen_out() {
      this.output = direct_select(this.$store.state.entries.edit.values, this.input) //select_aspect_loc(this.$store.state.entries, this.aspect_loc,false, null,true)
    }
  }
}
</script>

<style scoped>

</style>
