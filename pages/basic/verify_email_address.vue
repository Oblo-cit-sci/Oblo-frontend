<template>
</template>

<script>
  import {USER_LOGGED_IN} from "~/store/user"
  import TriggerSnackbarMixin from "../../components/TriggerSnackbarMixin"
  import LoginMixin from "../../components/actor/LoginMixin"
  import NavBaseMixin from "~/components/NavBaseMixin"

  export default {
    name: "verify_email_address",
    mixins: [TriggerSnackbarMixin, LoginMixin, NavBaseMixin],
    created() {
      const logged_in = this.$store.getters[USER_LOGGED_IN]
      this.$api.verify_email_address(this.$route.query.user, this.$route.query.code).then(({data}) => {
        if (!logged_in && data.user) {
          this.ok_snackbar("Email address verified")
          this.process_login(data)
          this.home()
        } else {
          this.ok_snackbar(data.data)
          this.home()
        }
      }).catch(err => {
        console.log(err)
          this.err_error_snackbar()
      })
    },
  }
</script>

<style scoped>

</style>
