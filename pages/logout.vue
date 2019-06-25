<template>
  <div></div>
</template>

<script>
  export default {
    name: "logout",
    created() {
      this.$axios.get("/logout").then((res) => {
        this.done()
      }).catch((err) => {
        console.log("logout error", err.response);
          if (err.response.status === 401) {
            this.done()
          }
        }
      )
    },
    methods: {
      done() {
        this.$store.commit("user/logout");
        this.$store.commit("set_snackbar", {message: "You are logged out", ok: true});
        this.$store.commit("entries/clear")
        this.$store.commit("clear")
        this.$router.push("/")
      }
    }
  }
</script>

<style scoped>

</style>
