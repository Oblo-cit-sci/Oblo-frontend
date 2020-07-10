import PersistentStorageMixin from "~/components/util/PersistentStorageMixin";
import {USER_LOGIN} from "~/store/user";

export default {
  name: "LoginMixin",
  mixins: [PersistentStorageMixin],
  methods: {
    process_login(login_response_data) {
      this.$store.dispatch("user/login", login_response_data)
      const settings = this.$store.getters["user/settings"]
      if (settings.fixed_domain) {
        this.$store.commit("app/fixed_domain", settings.fixed_domain)
      }

      this.persist_user_data()
      this.persist_auth_token()
      const ui_lang = this.$store.getters["user/settings"]["ui_language"] || null
      this.$store.commit("app/ui_language", ui_lang)
      if (ui_lang) {
        this._i18n.locale = ui_lang
      }
      this.$axios.setToken(login_response_data.access_token, "Bearer")
    }
  }
}
