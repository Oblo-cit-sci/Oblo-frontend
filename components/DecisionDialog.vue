<template lang="pug">
  v-dialog(v-bind:value="open" max-width="500" lazy=true v-on:update:value="$emit('update:open', false)")
    v-card
      v-card-title {{title}}
      v-card-text {{text}}
      v-card-actions
        v-btn(text :color="cancel_color" @click="cancel") {{cancel_text}}
        v-btn(text :color="confirm_color" @click="confirm") {{confirm_text}}
</template>

<script>

  const colors=["error", "success"]

  export default {
    name: "DecisionDialog",
    props: {
      id: {required: true},
      open: {type: Boolean, default: false},
      title: {type: String, default: ""},
      text: {type: String, default: ""},
      cancel_text: {type: String, default: "Cancel"},
      cancel_color: {type: String, default: "error"},
      confirm_text: {type: String, default: "Confirm"},
      confirm_color: {type: String, default: "success"},
    },
    methods: {
      cancel() {
        this.$emit("update:open", false)
        this.$emit("action", {confirm: false, id: this.id})
      },
      confirm() {
        this.$emit("update:open", false)
        this.$emit("action", {confirm: true, id: this.id})
      }
    },
  }
</script>

<style scoped>

</style>
