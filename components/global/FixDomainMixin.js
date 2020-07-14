import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"

export default {
  name: "FixDomainMixin",
  mixins: [TriggerSnackbarMixin, SettingsChangeMixin],
  computed: {
    is_fixed_domain() {
      return this.$_.get(this.$store.getters["user/settings"], "fixed_domain", null)
    }
  },
  methods: {
    fix_domain(domain_name = null, update_server = true) {
      this.set_settings_value("fixed_domain", domain_name)
    },
    reset_fixed_domain(snackbar) {
      this.reset_settings_value("fixed_domain", "Fixed domain reset")
    }
  }
}
