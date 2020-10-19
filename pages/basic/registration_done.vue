<template lang="pug">
  div
    v-row
      v-col(cols="12" md="6")
        v-alert(color="info")
          h3 Check your email!
          div We send you an email with a verification link. Check your spam folder if it is not visible.
          div If you haven't received the verification link request a new email!
          div
            v-btn(@click="request_verification_mail" color="warning" rounded) {{$t('page.login.btn_resend_mail')}}
    LoginComponent
      div
</template>

<script>
import LoginComponent from "~/components/page_components/LoginComponent"

export default {
  name: "registration_done",
  mixins: [],
  components: {LoginComponent},
  props: {},
  data() {
    return {}
  },
  computed: {
    username() {
      return this.$route.query.username
    }
  },
  methods: {
    request_verification_mail() {
      this.$api.actor.resend_email_verification_mail(this.username).then(({data}) => {
        this.ok_snackbar(data.data)
      }).catch(err => {
        this.err_error_snackbar(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
