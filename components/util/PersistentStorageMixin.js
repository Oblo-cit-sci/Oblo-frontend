export default {
  name: "PersistentStorageMixin",
  methods: {
    async store_value(key, value) {
      const result = await this.$localforage.setItem(key, value)
      // console.log(result)
      if (!result) {
        console.error("browser db error")
      }
      //   .then(() => {
      // }).catch(err => {
      //   console.log("browser db error")
      //   console.log(err)
      // })
    },
    async clear_storage() {
      await this.$localforage.clear()
    },
    async remove_from_storage(key) {
      await this.$localforage.removeItem(key)
    },
    async persist_entries() {
      // console.log("persist entries")
      await this.store_value("entries", this.$store.getters["entries/all_drafts"]().map(e => [e.uuid, e]))
    },
    /** could be used more....
    instead we have 'store_edit' in several locations
     **/
    async persist_edit_entry() {
      const edit = this.$store.getters["get_edit"]()
      if (edit) {
        await this.$localforage.setItem("edit_entry", edit)
      }
    },
    async persist_user_key() {
      await this.store_value("user_key", this.$store.getters.user_key)
    },
    async persist_notes() {
      await this.store_value("notes", this.$store.getters["templates/all_notes"])
    },
    async persist_user_data() {
      await this.store_value("user_data", this.$store.getters.user)
    },
    async persist_user_settings() {
      await this.store_value("user_settings", this.$store.getters["user/settings"])
    },
    async persist_for_offline_mode() {
      // user-data & settings
      await this.persist_user_data()
      await this.persist_user_settings()
      // domains
      await this.persist_domains()
      // templates & codes...
      await this.persist_templates()
      // messages
      await this.persist_messages()
      // misc
      const offline_misc_data = {
        "app/platform_data": this.$store.getters["app/platform_data"]
      }
      await this.store_value("offline_misc_data", offline_misc_data)
    },
    async persist_domains() {
      await this.store_value("domains", Array.from(this.$store.state.domain.domains.entries()))
    },
    async persist_templates() {
      const store_templates = this.$_.cloneDeep(this.$store.state.templates)
      store_templates.codes = Array.from(store_templates.codes.entries())
      store_templates.entry_types = Array.from(store_templates.entry_types.entries())
      await this.store_value("templates", store_templates)
    },
    async persist_messages() {
      await this.store_value("messages", this.$i18n.messages)
    }
  }
}
