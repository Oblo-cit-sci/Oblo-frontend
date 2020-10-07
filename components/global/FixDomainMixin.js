import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {all_pages_n_actions} from "~/lib/pages"
import {FIXED_DOMAIN, NO_DOMAIN} from "~/lib/consts"

export default {
  name: "FixDomainMixin",
  mixins: [TriggerSnackbarMixin, SettingsChangeMixin],
  computed: {
    is_fixed_domain() {
      return this.$_.get(this.$store.getters["user/settings"], FIXED_DOMAIN, null)
    },
    has_multiple_domains() {
      return this.$_.filter(this.$store.getters.domains, d => d.name !== NO_DOMAIN).length > 1
    },
    get_one_domain_name() {
      return this.$store.getters.domains[0].name
    }
  },
  methods: {
    fix_domain(domain_name = null, update_server = true) {
      this.set_settings_value(FIXED_DOMAIN, domain_name)
      if (domain_name)
        all_pages_n_actions[0].to = `/domain?f=${domain_name}`
      else
        all_pages_n_actions[0].to = "/"
    },
    reset_fixed_domain(snackbar) {
      this.reset_settings_value(FIXED_DOMAIN, "Fixed domain reset")
    }
  }, watch: {
    is_fixed_domain(domain_name) {
      if (domain_name)
        all_pages_n_actions[0].to = `/domain?f=${domain_name}`
      else
        all_pages_n_actions[0].to = "/"
    }
  }
}
