import {NO_DOMAIN, QP_D, QP_F, VIEW} from "~/lib/consts";

import FixDomainMixin from "~/components/global/FixDomainMixin"
import {PAGE_DOMAIN, PAGE_INDEX} from "~/lib/pages"
import HomePathMixin from "~/components/menu/HomePathMixin";
import LanguageMixin_ from "~/components/downstream/LanguageMixin_";
import {default_settings} from "~/lib/settings";

export default {
  name: "NavBaseMixin",
  mixins: [FixDomainMixin, HomePathMixin, LanguageMixin_],
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
      // console.log("going home", this.is_fixed_domain)
      // console.log("-> home", this.is_fixed_domain, this.fixed_domain)
      if (this.is_fixed_domain) {
        // this.$router.push("domain?d=licci")
        this.$router.push({
            name: PAGE_DOMAIN,
            query: {[QP_F]: this.fixed_domain}
          }
        )
      } else {
        this.$router.push("/")
      }
    },
    to_set_domain() {
      let domain_name = this.$store.getters["domain/act_domain_name"]
      if (domain_name === NO_DOMAIN) {
        this.$router.push({name: PAGE_INDEX})
      } else {
        this.$router.push({
          name: PAGE_DOMAIN, query: {[this.domain_param_key]: domain_name}
        })
      }
    },
    async prepare_goto_domain(domain_name, language, fixed = false ) {
      console.log("prepare goto", domain_name, fixed, language)
      await this.complete_language_domains(domain_name, language)
      this.$store.commit("domain/set_act_domain", domain_name)
      this.fix_domain(domain_name)
      this.$store.commit("domain/set_act_lang_domain_data", {domain_name, language})

      // todo, maybe this should be replaces by something in the store
      // similar the change of the home route...
      default_settings.fixed_domain = domain_name
      // console.log("route name", this.$route.name, this.$route.name === PAGE_INDEX)
      this.set_home_path_domain(domain_name)
    },
    to_domain(domain_name, fixed = false, callback) {
      this.$router.push({
        name: PAGE_DOMAIN, query: {[fixed ? QP_F : this.domain_param_key]: domain_name}
      }, () => {
        if (callback) {
          callback()
        }
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
        const {name, query} = this.$route
        this.$store.commit("init_page_path",{name, query})
      }
      // console.log("has full entry", this.$store.getters["entries/has_full_entry"](uuid))
      // console.log("checkk", this.$store.getters["entries/get_entry"](uuid))
      this.$router.push(route)
    },
    to_no_entry_route() {
      // console.log("to no entry....")
      if (this.$route.name === PAGE_DOMAIN) {
        this.to_set_domain()
      } else {
        this.home()
      }
    },
    back(remove_params = []) {
      // todo maybe use util.route_change_query
      const last_path = Object.assign({}, this.$store.getters["last_page_path"])
      // console.log(remove_params, "lp", last_path)
      this.$store.commit("pop_last_page_path")
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
