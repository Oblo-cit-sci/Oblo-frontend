import {QP_D, QP_F, VIEW} from "~/lib/consts";
import {DOMAIN, INIT_PAGE_PATH} from "~/store"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_DOMAIN} from "~/lib/pages"

export default {
  name: "NavBaseMixin",
  mixins: [FixDomainMixin],
  methods: {
    home() {
      // actually the redirect takes care of this...
      if (this.is_fixed_domain) {
        return this.$router.push("/domain", {
          f: this.is_fixed_domain
        })
      }
      this.$router.push("/")
    },
    to_set_domain() {
      let domain = this.$store.getters[DOMAIN]
      this.$router.push({
        path: PAGE_DOMAIN, query: {[QP_D]: domain.name}
      })
    },
    to_domain(domain_name, fixed = false) {
      this.$router.push({
        path: PAGE_DOMAIN, query: {[fixed ? QP_F : QP_D]: domain_name}
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
