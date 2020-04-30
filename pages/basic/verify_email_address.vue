<template>

</template>

<script>
  import {USER_LOGGED_IN} from "../../store/user"
  import TriggerSnackbarMixin from "../../components/TriggerSnackbarMixin"
  import LoginMixin from "../../components/actor/LoginMixin"

  export default {
    name: "verify_email_address",
    mixins: [TriggerSnackbarMixin, LoginMixin],
    created() {
      const logged_in = this.$store.getters[USER_LOGGED_IN]
      this.$api.verify_email_address(this.$route.query.user, this.$route.query.code).then(({data}) => {
        if (!logged_in && data.user) {
          this.ok_snackbar("Email address verified")
          this.process_login(data)
          this.$router.push("/")
        } else {
          this.ok_snackbar(data.data)
          this.$router.push("/")
        }
      }).catch(err => {
        const response = err.response
        const msg = this.$_.get(response, "data.error.msg", "Something went wrong")
        this.error_snackbar(msg)
      })
    },
  }
</script>

<style scoped>

</style>
