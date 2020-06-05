<template lang="pug">
  v-bottom-sheet(hide-overlay :value="privacy_sheet_open")
    div(style="background: white;height: 100%; width: 100%")
      div.pt-5.pl-5.pb-2
        h3.mb-3 Your Privacy
          v-container(style="margin: 0")
            v-row
              v-col(cols="12" lg="8")
                div(style="font-size: 1.2rem") We do not use cookies nor do we include any 3rd party cookies. We only store the data that you directly provide in your public user profile or in the entries you create or contribute to. <a href="/about#privacy">Read our privacy policy for more information.</a>
              v-spacer
              v-col
                v-btn(@click="$emit('update:privacy_sheet_open', false)") Thank you
</template>

<script>
  export default {
    name: "PrivacySheet",
    mixins: [],
    components: {},
    props: {
      privacy_sheet_open: Boolean
    },
    data() {
      return {
        privacy_shown: false,
      }
    },
    computed: {},
    methods: {}
  }
</script>

<style scoped>

</style>
