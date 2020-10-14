<template lang="pug">
  v-toolbar(flat)
    v-btn(icon v-if="edit" @click="set_edit(false)")
      v-icon mdi-arrow-left
    v-toolbar-title
      span.font-weight-bold {{label}}
      div(v-if="!edit") {{value}}
    v-btn(icon v-if="!edit" color='green' size="32" @click="set_edit(true)")
      v-icon  mdi-pencil-outline
</template>

<script>
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
    value: {
    }
  },
  methods: {
    set_edit(edit) {
      this.$emit("update:edit", edit)
    }
  }
}
</script>

<style scoped>

</style>
