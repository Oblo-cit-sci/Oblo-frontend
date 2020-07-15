<template lang="pug">
  v-flex(xs12 sm10 md6)
    h3 {{$t("reset_mail_sent.h1")}}
    p
      div {{$t("reset_mail_sent.p1")}}
      div {{$t("reset_mail_sent.p2")}}
    div.mt-3
      nuxt-link(href="/basic/init_password_reset") {{$t("reset_mail_sent.a")}}
</template>

<script>
  export default {
    name: "reset_mail_sent",
    computed: {
      obsure_email() {
        return "your address"
      }
    }
  }

</script>

<style scoped>

</style>
