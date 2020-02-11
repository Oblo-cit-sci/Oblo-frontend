import {ENTRYTYPES_ALL_NOTES, USER_GET_USER_DATA} from "../lib/store_consts";

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
    persist_entries() {
      this.store_value("entries", this.$store.state.entries.entries)
    },
    persist_user_key() {
      this.store_value("user_key", this.$store.getters.user_key)
    },
    persist_draft_numbers() {
      this.store_value("draft_numbers", this.$store.getters.draft_numbers)
    },
    persist_notes() {
      this.store_value("notes", this.$store.getters[ENTRYTYPES_ALL_NOTES])
    },
    persist_user_data() {
      this.store_value("user_data", this.$store.getters[USER_GET_USER_DATA])
    }
  }
}
