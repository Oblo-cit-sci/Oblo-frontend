<template lang="pug">
  v-snackbar(bottom=true v-model="show" :timeout=1400 :color="color")
    .snack_text {{message}}
</template>

<script>
  import TriggerSnackbarMixin from "./TriggerSnackbarMixin";

  export default {
    name: "GlobalSnackbar",
    mixins: [TriggerSnackbarMixin],
    data() {
      return {
        show: false,
        color: null,
        message: ""
      }
    },
    created: function () {
      this.$store.watch(state => state.snackbar.trigger, () => {
          let snackbar = this.$store.state.snackbar;
          if (snackbar.trigger) {
            this.show = true
            this.message = snackbar.message
            this.color = snackbar.ok === true ? "success" : "error"
            this.reset_trigger()
          }
        }
      )
    }
  }
</script>

<style scoped>
  .snack_text {
    text-align: center;
    width: 100%;
  }
</style>
