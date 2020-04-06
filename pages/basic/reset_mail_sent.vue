<template lang="pug">
  v-flex(xs12 sm10 md6)
    h3 Check your email
    p
      div We've sent an email to {{obsure_email}}. Click the link in the email to reset your password.
      div If you don't see the email, check other places it might be, like your junk, spam, social, or other folders.
    div.mt-3
      a(href="basic/password_reset") I didn't receive the email
</template>

<script>
  export default {
    name: "reset_mail_sent",
    computed: {
      obsure_email() {
        return "your email"
        // return this.$route.query.email
      }
    }
  }

</script>

<style scoped>

</style>
