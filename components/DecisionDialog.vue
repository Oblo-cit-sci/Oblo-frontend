<template lang="pug">
  v-dialog(v-bind:value="open" max-width="300px" lazy=true)
    v-card
      v-card-title {{title}}
      v-card-text {{text}}
      v-card-actions
        v-btn(flat :color="cancel_color" @click="cancel") {{cancel_text}}
        v-btn(flat :color="confirm_color" @click="confirm") {{confirm_text}}
</template>

<script>
  export default {
    name: "DecisionDialog",
    props: {
      id: {required: true},
      open: {type: Boolean, default: false},
      title: {type: String, default: ""},
      text: {type: String, default: ""},
      confirm_text: {type: String, default: "Confirm"},
      cancel_text: {type: String, default: "Cancel"},
      confirm_color: {type: String, default: "success"},
      cancel_color: {type: String, default: "error"},
    },
    methods: {
      cancel() {
        this.$emit("update:open", false)
        //this.$emit("action", {confirm: false, id: this.name})
      },
      confirm() {
        this.$emit("update:open", false)
        this.$emit("action", {confirm: true, id: this.id})
      }
    }
  }
</script>

<style scoped>

</style>
