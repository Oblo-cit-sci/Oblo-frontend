<template lang="pug">
  div
    h2 Welcome visitor
    div {{welcome}}
      br
      br
    div {{login}}
    v-btn(nuxt to="/login" color="success") Login
    br
    br
    div {{register}}
    v-btn(nuxt to="/register" color="success") Register

</template>

<script>
  export default {
    name: "visitor",
    data() {
      return {
        welcome: "As a visitor you can browse through all public entries and create some entries.",
        login: "If you already have an account, you can login here:",
        register: "If do not have account yet but you want to want all features, including, setting the privacy and licenses of your entries, you can register.",
        offline:"If you are using this app while being offline, you can import your previously imported profile data into the app. "
      }
    }
  }
</script>

<style scoped>

</style>
