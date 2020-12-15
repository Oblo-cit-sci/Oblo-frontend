<template lang="pug">
  v-toolbar(flat)
    v-btn(icon v-if="edit" @click="set_edit(false)")
      v-icon {{back_icon}}
    v-toolbar-title
      span.font-weight-bold {{label}}
      div(v-if="!edit") {{value}}
    v-btn(icon v-if="!edit" color='green' size="32" @click="set_edit(true)")
      v-icon {{edit_icon}}
</template>

<script>
import {unpack} from "~/lib/aspect";

export default {
  name: "EditContextTitle",
  props: {
    edit: {
      type: Boolean,
    },
    label: {
      type: String,
      required: true
    },
    mvalue: {
      type: Object
    },
    back_icon: {
      type: String,
      default: "mdi-arrow-left"
    },
    edit_icon: {
       type: String,
      default: "mdi-pencil-outline"
    }
  },
  methods: {
    set_edit(edit) {
      this.$emit("update:edit", edit)
    }
  },
  computed: {
    // todo prop should be mvalue, and this value
    value() {
      return unpack(this.mvalue)
    }
  }
}
</script>

<style scoped>

</style>
