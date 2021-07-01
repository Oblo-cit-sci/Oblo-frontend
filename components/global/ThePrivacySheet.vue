<template lang="pug">
  v-bottom-sheet(hide-overlay persistent :value="privacy_sheet_open")
    div(style="background: white;height: 100%; width: 100%")
      div.pt-5.pl-5.pb-2
        h3.mb-1 {{$t("comp.privacy_notification.h")}}
        v-container.py-2(style="margin: 0")
          v-row
            v-col.py-1.pl-0(cols="12" lg="8")
              div(style="font-size: 1.1rem" v-html='$t("comp.privacy_notification.p")')
            v-col.py-1.pl-0
              v-btn(@click="close") {{$t("comp.privacy_notification.btn")}}
          v-row
            FooterContent
</template>

<script>
  import Footer from "~/components/global/Footer";
  import FooterContent from "~/components/global/FooterContent";
  export default {
    name: "ThePrivacySheet",
    mixins: [],
    components: {FooterContent, Footer},
    created() {
      // if( process.env.NODE_ENV === "development") {
      //   this.$store.commit("app/close_privacy_sheet")
      // }
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
