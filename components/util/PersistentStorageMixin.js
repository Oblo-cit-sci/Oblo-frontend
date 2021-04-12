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
    },
    persist_for_offline_mode() {
      // domains
      this.persist_domains()
      // templates & codes...
      this.persist_templates()
      // messages
      this.persist_messages()
    },
    persist_domains() {
      this.store_value("domains", Array.from(this.$store.state.domain.domains.entries()))
    },
    persist_templates() {
      const store_templates = this.$_.cloneDeep(this.$store.state.templates)
      store_templates.codes = Array.from(store_templates.codes.entries())
      store_templates.entry_types = Array.from(store_templates.entry_types.entries())
      this.store_value("templates", store_templates)
    },
    persist_messages() {
      this.store_value("messages", this.$i18n.messages)
    }
  }
}
