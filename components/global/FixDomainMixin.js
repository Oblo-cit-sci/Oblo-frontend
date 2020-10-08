import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {all_pages_n_actions} from "~/lib/pages"
import {FIXED_DOMAIN, NO_DOMAIN} from "~/lib/consts"
import HomePathMixin from "~/components/menu/HomePathMixin"

export default {
  name: "FixDomainMixin",
  mixins: [TriggerSnackbarMixin, SettingsChangeMixin, HomePathMixin],
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
      this.set_domain_as_home_path(domain_name)
    },
    reset_fixed_domain(snackbar) {
      this.reset_settings_value(FIXED_DOMAIN, "Fixed domain reset")
    },
    set_domain_as_home_path(domain_name) {
      if (domain_name)
        this.set_home_path(`/domain?f=${domain_name}`)
      else
        this.set_home_path()
    }
  }, watch: {
    is_fixed_domain(domain_name) {
      this.set_domain_as_home_path(domain_name)
    }
  }
}
