import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"

export default {
  name: "FixDomainMixin",
  mixins: [TriggerSnackbarMixin],
  computed: {
    is_fixed_domain() {
      return this.$_.get(this.$store.getters["user/settings"],"fixed_domain", null)
    }
  },
  methods: {
    fix_domain(domain_name = null, update_server=true) {
      this.$store.commit("user/change_setting", {key: "fixed_domain", value: domain_name})
      if (this.$store.getters["user/logged_in"] && update_server) {
        this.$api.post_actor__me({"settings": {"fixed_domain": domain_name}})
      }
    },
    reset_fixed_domain(snackbar) {
      this.fix_domain(null)
      if (snackbar) {
        this.ok_snackbar("Fixed domain reset")
      }
    },
  }
}
