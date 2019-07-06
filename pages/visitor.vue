<template lang="pug">
  div
    h2 Welcome visitor
    div {{welcome_text}}
    br
    br
    div(v-if="connected")
      div {{login}}
        v-btn(nuxt to="/login" color="success") Login
        br
        br
      div {{register}}
        v-btn(nuxt to="/register" color="success") Register
        br/
        br/
    div {{disconnected_text}}
    br
    LoadFileButton(@fileload="loaded($event)")
</template>

<script>
  import LoadFileButton from "../components/LoadFileButton";

  export default {
    name: "visitor",
    components: {LoadFileButton},
    data() {
      return {
        connected: this.$store.state.connected,
        welcome_texts: {
          connected: "As a visitor you can browse through all public entries and create some entries.",
          disconnected: "You are using the app offline. While being offline, you can create entries and view those which you downloaded before. You can neither register nor login but load your profile."
        },
        login_text: "If you already have an account, you can login.",
        register_text: "If do not have account yet but you want to want all features, including, setting the privacy and licenses of your entries, you can register.",
        disconnected_text: "If you are using this app while being offline, you can import your previously exported profile data into the app. "
      }
    }, methods: {
      loaded(data) {
        console.log(data)
      }
    },
    created() {
    },
    computed: {
      welcome_text() {
        return this.connected ? this.welcome_texts.connected : this.welcome_texts.disconnected
      }
    }
  }
</script>

<style scoped>

</style>
