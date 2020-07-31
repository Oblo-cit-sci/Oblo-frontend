import PersistentStorageMixin from "~/components/util/PersistentStorageMixin";
import {USER_LOGIN} from "~/store/user";
import FixDomainMixin from "~/components/global/FixDomainMixin"
import {UI_LANGUAGE} from "~/lib/consts"

export default {
  name: "LoginMixin",
  mixins: [PersistentStorageMixin],
  methods: {
    process_login(login_response_data) {
      this.$store.dispatch("user/login", login_response_data)
      const settings = this.$store.getters["user/settings"]
      this.persist_user_data()
      this.persist_auth_token()
      // todo maybe somewhere else, a language setter mixin...

      const ui_lang = this.$store.getters["user/settings"][UI_LANGUAGE] || null
      if (ui_lang) {
        this._i18n.locale = ui_lang
      }
      this.$axios.setToken(login_response_data.access_token, "Bearer")
    }
  }
}
