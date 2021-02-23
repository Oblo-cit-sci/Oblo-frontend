
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
      this.store_value("entries", this.$store.getters["entries/all_drafts"]().map(e => [e.uuid, e]))
    },
    persist_user_key() {
      this.store_value("user_key", this.$store.getters.user_key)
    },
    persist_notes() {
      this.store_value("notes", this.$store.getters["templates/all_notes"])
    },
    persist_user_data() {
      this.store_value("user_data", this.$store.getters.user)
    },
    persist_user_settings() {
      this.store_value("user_settings", this.$store.getters["user/settings"])
    }
  }
}
