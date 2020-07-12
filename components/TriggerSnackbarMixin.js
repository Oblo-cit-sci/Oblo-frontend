import {SNACKBAR, SNACKBAR_RESET} from "~/store";

export default {
  name: "TriggerSnackbarMixin",
  methods: {
    snackbar(ok, message) {
      this.$store.commit(SNACKBAR, {ok, message})
    },
    ok_snackbar(message) {
      this.$store.commit(SNACKBAR, {ok: true, message})
    },
    error_snackbar(message) {
      this.$store.commit(SNACKBAR, {ok: false, message})
    },
    err_error_snackbar(err) {
      this.error_snackbar(this.$_.get(err, "response.data.error.msg", this.$t("comp.snackbar.something_went_wrong")))
    },
    reset_trigger() {
      this.$store.commit(SNACKBAR_RESET)
    }
  },
}
