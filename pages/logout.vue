<template>
  <div></div>
</template>

<script>
  import {CLEAR, ENTRIES_CLEAR, USER_LOGOUT} from "../lib/store_consts";

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
        this.$store.commit(USER_LOGOUT);
        this.$store.commit(ENTRIES_CLEAR)
        this.$store.commit(CLEAR)
        this.$router.push("/")
        this.ok_snackbar("You are logged out")
      }
    }
  }
</script>

<style scoped>

</style>
