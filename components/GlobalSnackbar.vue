<template lang="pug">
  v-snackbar(bottom=true v-model="show" :timeout=1400 :color="color")
    .snack_text {{message}}
</template>

<script>
  export default {
    name: "GlobalSnackbar",
    data() {
      return {
        show: false,
        color: null,
        message: ""
      }
    },
    created: function () {
      this.$store.watch(state => state.snackbar.message, () => {
          console.log("SNACK")
          let snackbar = this.$store.state.snackbar;
          if (snackbar.message !== "") {
            this.show = true
            this.message = snackbar.message
            console.log("snackbar", snackbar)
            this.color = snackbar.ok === true ? "success" : "error"
            console.log(this.color);
            this.$store.commit('set_snackbar', {message: "", status: true})
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
