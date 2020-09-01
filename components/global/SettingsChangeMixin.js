import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import PersistentStorageMixin from "~/components/util/PersistentStorageMixin"
import {default_settings} from "~/lib/settings"

export default {
  name: "SettingsChangeMixin",
  mixins: [TriggerSnackbarMixin, PersistentStorageMixin],
  computed: {},
  methods: {
    setting(settings_key) {
      return this.$_.get(this.$store.getters["user/settings"], settings_key, default_settings[settings_key])
    },
    set_settings_value(settings_key, setting_value, update_server = true) {
      this.$store.commit("user/change_setting", {key: settings_key, value: setting_value})
      if (this.$store.getters["user/logged_in"] && update_server) {
        this.$api.actor.post_me({"settings": {[settings_key]: setting_value}})
        this.persist_user_settings()
      }
    },
    reset_settings_value(settings_key, snackbar = "") {
      this.set_settings_value(settings_key, default_settings[settings_key])
      if (snackbar !== "") {
        this.ok_snackbar(snackbar)
      }
    },
  }
}
