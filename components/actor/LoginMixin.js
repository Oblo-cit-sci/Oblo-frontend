import PersistentStorageMixin from "~/components/util/PersistentStorageMixin";
import {USER_LOGIN} from "~/store/user";

export default {
  name: "LoginMixin",
  mixins: [PersistentStorageMixin],
  methods: {
    process_login(login_response_data) {
      this.$store.dispatch(USER_LOGIN, login_response_data)
      this.persist_user_data()
      this.persist_auth_token()
      this.$axios.setToken("Bearer " + login_response_data.access_token)
    }
  }
}
