import PersistentStorageMixin from "~/components/util/PersistentStorageMixin";
import {UI_LANGUAGE} from "~/lib/consts"
import LanguageMixin from "~/components/LanguageMixin";

export default {
  name: "LoginMixin",
  mixins: [PersistentStorageMixin, LanguageMixin],
  methods: {
    process_login(login_response_data) {
      this.$store.dispatch("user/login", login_response_data)
      //const settings = this.$store.getters["user/settings"]
      this.persist_user_data()
      this.persist_auth_token()
      this.$axios.setToken(login_response_data.access_token, "Bearer")
    }
  }
}
