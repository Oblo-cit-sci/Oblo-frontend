<template lang="pug">
  v-dialog(v-model="dialog_open" max-width="500" persistent)
    v-card
      v-card-title {{config.title}}
      v-card-text {{config.text}}
        div(v-for="section in config.html_text" v-html="section")
      v-card-actions
        v-btn(v-if="config.show_cancel" text :color="config.cancel_color" @click="submit(false)") {{config.cancel_text}}
        v-btn(text :color="config.confirm_color" @click="submit(true)") {{config.confirm_text}}
</template>

<script>

import {BUS_DIALOG_OPEN} from "~/plugins/bus";

const colors = ["error", "success"]

export default {
  name: "DecisionDialog",
  created() {
    this.$bus.$on(BUS_DIALOG_OPEN, ({data, confirm_method, cancel_method}) => {
      // console.log("dialog-open", data, confirm_method)
      this.config = Object.assign(this.$_.cloneDeep(this.default_config), data)
      this.callback_methods = {
        confirm: confirm_method,
        cancel: cancel_method
      }
      this.dialog_open = true
    })
  },
  data() {
    return {
      dialog_open: false,
      config: {},
      callback_methods: {}
    }
  },
  computed: {
    default_config() {
      return {
        title: "",
        text: "",
        cancel_text: this.$t("comp.decision_dialog.cancel"),
        cancel_color: "error",
        confirm_text: this.$t("comp.decision_dialog.confirm"),
        confirm_color: "success",
        show_cancel: true
      }
    }
  },
  methods: {
    submit(confirm) {
      this.dialog_open = false
      const method = this.callback_methods[confirm ? "confirm" : "cancel"]
      if(method) {
        method()
      }
    }
  },
}
</script>

<style scoped>

</style>
