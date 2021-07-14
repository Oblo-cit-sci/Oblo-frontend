<template lang="pug">
  v-flex(xs12 sm10 md6)
    h3 {{$t("page.reset_mail_sent.h1")}}
    p
      div {{$t("page.reset_mail_sent.p1")}}
      div.font-weight-bold {{mail_address}}
      div {{$t("page.reset_mail_sent.p2")}}
    div.mt-3
      nuxt-link(to="/basic/init_password_reset") {{$t("page.reset_mail_sent.a")}}
</template>

<script>
  export default {
    name: "reset_mail_sent",
    computed: {
      mail_address() {
        return this.$route.query.address
      }
    }
  }

</script>

<style scoped>

</style>
