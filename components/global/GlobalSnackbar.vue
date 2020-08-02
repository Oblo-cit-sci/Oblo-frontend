<template lang="pug">
  v-snackbar(bottom=true v-model="show" centered :timeout="timeout" :color="color" multi-line)
    b.snack_text {{message}}
</template>

<script>
  import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
  import {SNACKBAR_TRIGGER} from "~/store";

  export default {
    name: "GlobalSnackbar",
    mixins: [TriggerSnackbarMixin],
    data() {
      return {
        show: false,
        color: null,
        message: "",
        timeout:2000
      }
    },
    created: function () {
      this.$store.watch(state => state.snackbar.trigger, () => {
          let snackbar = this.$store.state.snackbar
          if (snackbar.trigger) {
            this.show = true
            this.message = snackbar.message
            this.color = snackbar.ok === true ? "success" : "error"
            this.reset_trigger()
          }
        }
      )
    },
    computed: {
      trigger() {
        console.log("triggered")
        return this.$store.getters[SNACKBAR_TRIGGER]()
      }
    }
  }
</script>

<style scoped>
  .snack_text {
    text-align: center;
    /*width: 100%;*/
    position: absolute;
    font-size: 150%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
</style>
