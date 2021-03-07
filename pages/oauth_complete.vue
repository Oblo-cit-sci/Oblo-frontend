<template lang="pug">

</template>

<script>
export default {
  name: "oauth_complete",
  created() {
    // const {code, access_token} = this.$route.query
    this.$api.basic.oauth_complete(this.$route.query).then(() => {
      console.log("done")
    })
  }
}
</script>

<style scoped>

</style>
