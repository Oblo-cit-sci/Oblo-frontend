import {USER_GET_USER_DATA} from "~/store"
import {ADMIN} from "~/lib/consts"

export default {
  name: "IsAdminMixin",
  computed: {
    is_admin() {
      return this.$store.getters[USER_GET_USER_DATA].global_role === ADMIN
    }
  }
}
