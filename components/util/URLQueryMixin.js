import {EDIT, LANGUAGE, QP_D, QP_ENTRY_ACCESS_KEY, QP_ENTRY_MODE, QP_F, QP_UUID, VIEW} from "~/lib/consts"

export default {
  name: "URLQueryMixin",
  computed: {
    q() {
      return this.$route.query
    },
    query_param_domain() {
      const res = {}
      if (this.q[QP_D]) {
        res[QP_D] = this.q[QP_D]
      }
      if (this.q[QP_F]) {
        res[QP_F] = this.q[QP_F]
      }
      return res
    },
    query_param_domain_name() {
      return this.q[QP_D] || this.q[QP_F]
    },
    query_entry_uuid() {
      return this.q[QP_UUID]
    },
    entry_mode() {
      return this.$_.get(this.q, QP_ENTRY_MODE, VIEW)
    },
    query_language() {
      return this.q[LANGUAGE]
    },
    query_entry_access_key() {
      return this.q[QP_ENTRY_ACCESS_KEY]
    },
    profile_editing() {
      // same annoying shit in profile...
      const e = this.q[EDIT]
      if (e === undefined) {
        return false
      } else {
        if (typeof (e) === "string") {
          return e === "true"
        } else {
          return e
        }
      }

    }
  }
}
