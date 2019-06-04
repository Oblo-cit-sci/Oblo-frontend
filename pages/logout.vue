<template>
    <div></div>
</template>

<script>
    export default {
        name: "logout",
        created() {
          this.$axios.get("/logout").then((res) => {
            this.$store.commit("user/logout");
            this.$store.commit("set_snackbar", {message: "You are logged out", ok: true});
            this.$router.push("/")
          }).catch((req, res) => {
            console.log("logout ERROR");
            }
          )
        }
    }
</script>

<style scoped>

</style>
