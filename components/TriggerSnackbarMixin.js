import {SNACKBAR, SNACKBAR_RESET} from "../lib/store_consts";

export default {
      name: "TriggerSnackbarMixin",
      methods: {
        snackbar(ok, message) {
          this.$store.commit(SNACKBAR, {ok:ok, message:message})
        },
        ok_snackbar(message) {
          this.$store.commit(SNACKBAR, {message: message, ok: true})
        },
        error_snackbar(message) {
          this.$store.commit(SNACKBAR, {message:message, ok: false})
        },
        reset_trigger() {
          this.$store.commit(SNACKBAR_RESET)
        }
      },
}
