import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {FIXED_DOMAIN, NO_DOMAIN} from "~/lib/consts"
import HomePathMixin from "~/components/menu/HomePathMixin"

export default {
  name: "FixDomainMixin",
  mixins: [TriggerSnackbarMixin, SettingsChangeMixin, HomePathMixin],
  computed: {
    is_fixed_domain() {
      // console.log("fix domain. is fixed?",this.$store.getters["user/settings"])
      return this.$_.get(this.$store.getters["user/settings"], FIXED_DOMAIN, null)
    },
    has_multiple_domains() {
      return this.$_.filter(this.$store.getters["domain/domains"], d => d.name !== NO_DOMAIN).length > 1
    },
    get_one_domain_name() {
      return this.$_.find(this.$store.getters["domain/domains"], d => d.name !== NO_DOMAIN).name
    }
  },
  methods: {
    fix_domain(domain_name = null, update_server = true) {
      this.set_settings_value(FIXED_DOMAIN, domain_name, update_server)
      // console.log("fix_domain", domain_name)
      this.set_domain_as_home_path(domain_name)
      // console.log("domain fixed and set as home", domain_name)
    },
    reset_fixed_domain(snackbar) {
      this.reset_settings_value(FIXED_DOMAIN, "Fixed domain reset")
    },
    set_domain_as_home_path(domain_name) {
      // console.log("set_domain_as_home_path", domain_name)
      if (domain_name)
        this.set_home_path(`/domain?f=${domain_name}`)
      else
        this.set_home_path()
    }
  }, watch: {
    is_fixed_domain(domain_name) {
      // console.log("watch:is_fixed_domain", domain_name)
      this.set_domain_as_home_path(domain_name)
    }
  }
}
