import {QP_D, QP_F, VIEW} from "~/lib/consts"

export default {
  name: "URLQueryMixin",
  computed: {
    query_param_domain() {
      const res = {}
      if (this.$route.query[QP_D]) {
        res[QP_D] = this.$route.query[QP_D]
      }
      if (this.$route.query[QP_F]) {
         res[QP_F] = this.$route.query[QP_F]
      }
      return res
    },
    query_param_domain_name() {
      return this.$route.query[QP_D] || this.$route.query[QP_F]
    },
    entry_mode() {
      return this.$_.get(this.$route.query, "entry_mode", VIEW)
    }
  }
}
