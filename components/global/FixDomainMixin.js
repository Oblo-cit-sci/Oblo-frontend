import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import {FIXED_DOMAIN, NO_DOMAIN} from "~/lib/consts"
import HomePathMixin from "~/components/menu/HomePathMixin"

import {mapGetters} from "vuex"

export default {
  name: "FixDomainMixin",
  mixins: [TriggerSnackbarMixin, SettingsChangeMixin, HomePathMixin],
  computed: {
    ...mapGetters({fixed_domain: "fixed_domain", get_domains: "domain/domains"}),
    is_fixed_domain() {
      return !!this.fixed_domain
    },
    has_multiple_domains() {
      return this.$_.filter(this.get_domains(), d => d.name !== NO_DOMAIN).length > 1
    },
    get_one_domain_name() {
      return this.$_.find(this.get_domains(), d => d.name !== NO_DOMAIN).name
    }
  },
  methods: {
    fix_domain(domain_name = null, update_server = true) {
      this.set_settings_value(FIXED_DOMAIN, domain_name, update_server)
      if (!domain_name) {
        this.reset_fixed_domain()
        return
      }
      // console.log("fix_domain", domain_name)
      this.set_domain_as_home_path(domain_name)
      // console.log("domain fixed and set as home", domain_name)
    },
    reset_fixed_domain() {
      this.reset_settings_value(FIXED_DOMAIN)
      this.ok_snackbar(this.$t("page.settings.fixed_domain.fixed_domain_reset"))
    },
    set_domain_as_home_path(domain_name) {
      // console.log("FixDomainMixin:set_domain_as_home_path", domain_name)
      if (domain_name === NO_DOMAIN) {
        console.log("fixe_d_mxn: set_domain_as_home_path should rather be null not no_domain")
        this.reset_fixed_domain()
        return
      }
      // todo cleaner to: name, query
      this.set_home_path_domain(domain_name, true)
    }
  }, watch: {
    // fixed_domain(domain_name) {
    //   console.log("fixed domain changed...", domain_name)
    //   if (!domain_name)
    //     this.reset_fixed_domain()
    // }
  }
}
