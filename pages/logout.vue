<template>
    <div></div>
</template>

<script>
    export default {
        name: "logout",
        created() {

          this.$axios("/logout-pre").then((res) => {
            console.log(res.data)
          }).catch((req, res) => {
              console.log("logout-pre ERROR");
            }
          )

          this.$axios.get("/logout").then((res) => {
            this.$store.commit("logout");
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
