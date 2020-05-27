import {
  ENTRIES_ALL_DRAFTS, ENTRIES_ALL_ENTRIES_UUID_ENTRY_ARR,
} from "~/store/entries";
import {TEMPLATES_ALL_NOTES} from "~/store/templates";
import {USER_GET_AUTH_TOKEN} from "~/store/user";

export default {
  name: "PersistentStorageMixin",
  methods: {
    store_value(key, value) {
      this.$localForage.setItem(key, value).then(() => {
      }).catch(err => {
        console.log("browser db error")
        console.log(err)
      })
    },
    clear_storage() {
      this.$localForage.clear()
    },
    remove_from_storage(key) {
      this.$localForage.removeItem(key)
    },
    persist_entries() {
      // console.log("persist entries")
      this.store_value("entries", this.$store.getters[ENTRIES_ALL_DRAFTS]().map(e => [e.uuid, e]))
    },
    persist_user_key() {
      this.store_value("user_key", this.$store.getters.user_key)
    },
    persist_draft_numbers() {
      this.store_value("draft_numbers", this.$store.getters.draft_numbers)
    },
    persist_notes() {
      this.store_value("notes", this.$store.getters[TEMPLATES_ALL_NOTES])
    },
    persist_user_data() {
      this.store_value("user_data", this.$store.getters.user)
    },
    persist_auth_token() {
      this.store_value("auth_token", this.$store.getters[USER_GET_AUTH_TOKEN])
    }
  }
}
