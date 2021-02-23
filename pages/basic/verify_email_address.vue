<template>
</template>

<script>
import TriggerSnackbarMixin from "../../components/TriggerSnackbarMixin"
import NavBaseMixin from "~/components/NavBaseMixin"
import {PAGE_LOGIN} from "~/lib/pages";

export default {
  name: "verify_email_address",
  mixins: [TriggerSnackbarMixin, NavBaseMixin],
  created() {
    const logged_in = this.$store.getters["user/logged_in"]
    this.$api.actor.verify_email_address(this.$route.query.user, this.$route.query.code).then(({data}) => {
      this.ok_snackbar(data.msg)
      this.$router.push({name: PAGE_LOGIN})
    }).catch(err => {
      console.log(err)
      this.err_error_snackbar(err)
    })
  },
}
</script>

<style scoped>

</style>
