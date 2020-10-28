import {NO_DOMAIN, QP_D, QP_F, VIEW} from "~/lib/consts";
import {INIT_PAGE_PATH, LAST_BASE_PAGE_PATH, POP_LAST_PAGE_PATH} from "~/store"
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_DOMAIN, PAGE_INDEX} from "~/lib/pages"

export default {
  name: "NavBaseMixin",
  mixins: [FixDomainMixin],
  computed: {
    is_domain_page() {
      return this.$route.name === PAGE_DOMAIN
    },
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
      let domain_name = this.$store.getters["domain/act_domain_name"]
      if (domain.name === NO_DOMAIN) {
        this.$router.push({name: PAGE_INDEX})
      } else {
        this.$router.push({
          name: PAGE_DOMAIN, query: {[this.domain_param_key]: domain.domain_name}
        })
      }
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
    },
    back(remove_params = []) {
      // todo maybe use util.route_change_query
      const last_path = Object.assign({}, this.$store.getters[LAST_BASE_PAGE_PATH])
      // console.log(remove_params, "lp", last_path)
      this.$store.commit(POP_LAST_PAGE_PATH)
      if (!this.$_.isEmpty(last_path)) {
        for (let p of remove_params) {
          delete last_path.query[p]
        }
        this.$router.push(last_path)
      } else {
        this.home()
      }
    }
  }
}
