<template lang="pug">
  div
    v-row
      v-col(cols="12" md="6")
        v-alert(color="info")
          h3 {{$t("page.registration_done.h1")}}
          div {{$t("page.registration_done.p1")}}
          div {{$t("page.registration_done.p2")}}
          div
            v-btn(@click="request_verification_mail" color="warning" rounded) {{$t('page.login.btn_resend_mail')}}
    LoginComponent
      div
</template>

<script>
import LoginComponent from "~/components/page_components/LoginComponent"
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";

export default {
  name: "registration_done",
  mixins: [TriggerSnackbarMixin],
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
        this.ok_snackbar(data.msg)
      }).catch(err => {
        // backend always answers ok
        this.err_error_snackbar(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
