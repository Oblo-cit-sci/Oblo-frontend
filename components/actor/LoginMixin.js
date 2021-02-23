import PersistentStorageMixin from "~/components/util/PersistentStorageMixin";
import {UI_LANGUAGE} from "~/lib/consts"
import LanguageMixin from "~/components/LanguageMixin";

export default {
  name: "LoginMixin",
  mixins: [PersistentStorageMixin, LanguageMixin],
  methods: {
    process_login(login_response_data) {

    }
  }
}
