<template lang="pug">
  v-snackbar(bottom=true v-model="show" centered :timeout="timeout" :color="color" multi-line)
    b.snack_text(:class="{small: long_text}") {{message}}
</template>

<script>
  import TriggerSnackbarMixin from "../TriggerSnackbarMixin";
  // You need to verify your email address before logging in
  export default {
    name: "TheSnackbar",
    mixins: [TriggerSnackbarMixin],
    data() {
      return {
        show: false,
        color: null,
        message: "",
        timeout:2500
      }
    },
    computed: {
      long_text() {
        return this.message.length > 40
      }
    },
    created: function () {
      this.$bus.$on("snackbar",(data) => {
        // this will cause the timer to reset, when the snackbar is already open...
        if(this.show) {
          this.timeout = this.timeout === 2000 ? 2001 : 2000
        }
        this.show = true
        this.message = data.message
        this.color = data.ok === true ? "success" : "error"
      })
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

  .small {
    font-size: 120%;
  }
</style>
