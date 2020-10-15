import {RESPONSE_ERROR_MSG} from "~/lib/consts"

export default {
  name: "TriggerSnackbarMixin",
  methods: {
    snackbar(ok, message) {
      this.$bus.$emit("snackbar", {ok, message})
      // this.$store.commit(SNACKBAR, {ok, message})
    },
    ok_snackbar(message) {
      this.$bus.$emit("snackbar", {ok:true, message})
      // this.$store.commit(SNACKBAR, {ok: true, message})
    },
    error_snackbar(message) {
      this.$bus.$emit("snackbar", {ok:false, message})
      // this.$store.commit(SNACKBAR, {ok: false, message})
    },
    err_error_snackbar(err) {
      this.error_snackbar(this.$_.get(err, RESPONSE_ERROR_MSG, this.$t("comp.snackbar.something_went_wrong")))
    }
    // reset_trigger() {
    //   this.$store.commit(SNACKBAR_RESET)
    // }
  },
}
