<template lang="pug">

</template>

<script>
export default {
  name: "oauth_complete",
  created() {
    const {code, access_token} = this.$route.query
    console.log(this.$route)
    this.$api.basic.oauth_complete(access_token, code).then(() => {
      console.log("done")
    })
  }
}
</script>

<style scoped>

</style>
