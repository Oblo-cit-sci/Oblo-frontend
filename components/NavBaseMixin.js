import {QP_D, QP_F, VIEW} from "~/lib/consts";
import {INIT_PAGE_PATH} from "~/store"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_DOMAIN} from "~/lib/pages"

export default {
  name: "NavBaseMixin",
  mixins: [FixDomainMixin],
  computed: {
    domain_param_key() {
      return this.is_fixed_domain ? QP_F : QP_D
    }
  },
  methods: {
    home() {
      // actually the redirect takes care of this...
      if (this.is_fixed_domain) {
        this.$router.push({
            name: PAGE_DOMAIN,
            [QP_F]: this.is_fixed_domain
          }
        )
      } else {
        this.$router.push("/")
      }
    },
    to_set_domain() {
      let domain = this.$store.getters.domain
      // todo should also be "name" not "path"
      this.$router.push({
        name: PAGE_DOMAIN, query: {[this.domain_param_key]: domain.name}
      })
    },
    to_domain(domain_name, fixed = false) {
      this.$router.push({
        name: PAGE_DOMAIN, query: {[fixed ? QP_F : this.domain_param_key]: domain_name}
      })
    },
    to_entry(uuid, mode = VIEW, query = {}, log_page = true) {
      // console.log("to entry")
      let route = {
        name: "entry",
        query: {
          uuid,
          entry_mode: mode,
          ...query
        }
      }
      if (log_page) {
        this.$store.commit(INIT_PAGE_PATH, this.$route)
      }
      this.$router.push(route)
    }
  }
}
