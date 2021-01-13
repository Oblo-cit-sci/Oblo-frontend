<template>
</template>

<script>
import TriggerSnackbarMixin from "../../components/TriggerSnackbarMixin"
import LoginMixin from "../../components/actor/LoginMixin"
import NavBaseMixin from "~/components/NavBaseMixin"

export default {
  name: "verify_email_address",
  mixins: [TriggerSnackbarMixin, LoginMixin, NavBaseMixin],
  created() {
    const logged_in = this.$store.getters["user/logged_in"]
    this.$api.actor.verify_email_address(this.$route.query.user, this.$route.query.code).then(({data}) => {
      if (!logged_in && data.user) {
        this.ok_snackbar(data.msg)
        this.process_login(data)
        this.home()
      } else {
        this.ok_snackbar(data.data)
        this.home()
      }
    }).catch(err => {
      console.log(err)
      this.err_error_snackbar(err)
    })
  },
}
</script>

<style scoped>

</style>
