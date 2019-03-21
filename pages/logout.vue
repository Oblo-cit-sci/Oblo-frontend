<template>
    <div></div>
</template>

<script>
    export default {
        name: "logout",
        created() {
          this.$axios.get("/logout").then(() => {
            this.$router.push("/")
          }).catch(() => {
            console.log("logout ERROR");
            }
          )
        }
    }
</script>

<style scoped>

</style>
