<template lang="pug">
  v-bottom-sheet(hide-overlay persistent :value="privacy_sheet_open")
    div(style="background: white;height: 100%; width: 100%")
      div.pt-5.pl-5.pb-2
        h3.mb-3 Your Privacy
          v-container(style="margin: 0")
            v-row
              v-col(cols="12" lg="8")
                div(style="font-size: 1.2rem") We do not use cookies nor do we include any 3rd party cookies. We only store the data that you directly provide in your public user profile or in the entries you create or contribute to. <a href="/about#privacy">Read our privacy policy for more information.</a>
              v-spacer
              v-col
                v-btn(@click="close") Thank you
</template>

<script>
  export default {
    name: "PrivacySheet",
    mixins: [],
    components: {},
    props: {
    },
    data() {
      return {
        privacy_shown: false,
      }
    },
    computed: {
      privacy_sheet_open: {
        get: function () {
          return this.$store.getters["app/privacy_sheet_open"]
        },
        set: function (val) {
          this.$store.commit("app/close_privacy_sheet")
        }
      }
    },
    methods: {
      close() {
        this.privacy_sheet_open = false
      }
    }
  }
</script>

<style scoped>

</style>
