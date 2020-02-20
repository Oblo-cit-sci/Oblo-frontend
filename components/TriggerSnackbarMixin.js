import {SNACKBAR, SNACKBAR_RESET} from "../lib/store_consts";

export default {
      name: "TriggerSnackbarMixin",
      methods: {
        snackbar(ok, message) {
          this.$store.commit(SNACKBAR, {ok, message})
        },
        ok_snackbar(message) {
          this.$store.commit(SNACKBAR, {ok:true, message})
        },
        error_snackbar(message) {
          this.$store.commit(SNACKBAR, {ok:false, message})
        },
        reset_trigger() {
          this.$store.commit(SNACKBAR_RESET)
        }
      },
}
