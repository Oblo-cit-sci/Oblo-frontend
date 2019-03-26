<template>
    <div></div>
</template>

<script>
    export default {
        name: "logout",
        created() {
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
