export default {
  name: "OfflineMixin",
  computed: {
    is_offline() {
      if (this.$store.getters.dev_offline !== null)
        return this.$store.getters.dev_offline
      else
        return this.$nuxt.isOffline // true // this.$nuxt.isOffline
    }
  },
  methods: {
    switch_offline() {
      this.$store.commit("dev_switch_offline")
    },
    async get_offline_data() {
      const domain_data = await this.$localforage.getItem("domains")
      const templates_data = await this.$localforage.getItem("templates")
      const messages = await this.$localforage.getItem("messages")
      const user_data = await this.$localforage.getItem("user_data")
      const user_settings = await this.$localforage.getItem("user_settings")
      const offline_misc_data = await this.$localforage.getItem("offline_misc_data")
      return {
        domain_data,
        templates_data,
        messages,
        user_data,
        user_settings,
        offline_misc_data
      }
    },
    async load_offline_data() {
      const domain_data = await this.$localForage.getItem("domains")
      this.$store.commit("domain/set_from_storage", domain_data)
      const tempates_data = await this.$localForage.getItem("templates")
      this.$store.commit("templates/set_from_storage", tempates_data)

      const messages = await this.$localForage.getItem("messages")
      for (let lang in messages) {
        this.$i18n.setLocaleMessage(lang, messages[lang])
      }
      this.$store.commit("set_available_languages", Array.from(Object.keys(messages)))
      const user_data = await this.$localforage.getItem("user_data")
      this.$store.commit("user/set_user_data", user_data)
      const user_settings = await this.$localforage.getItem("user_settings")
      this.$store.commit("user/set_settings", user_settings)

      const offline_misc_data = await this.$localForage.getItem("offline_misc_data")
      await this.$store.dispatch("set_offline_misc_data", offline_misc_data)
    }
  }
}
