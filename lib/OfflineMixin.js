import EnvMixin from "~/components/global/EnvMixin";
import FilterMixin from "~/components/FilterMixin";

export default {
  name: "OfflineMixin",
  mixins: [EnvMixin, FilterMixin],
  computed: {
    is_offline() {
      if (this.$store.getters.dev_offline !== null) {
        return this.$store.getters.dev_offline
      }   else {
        if (this.get_env_dev_variable("IGNORE_OFFLINE", false))
          return false
        return this.$nuxt.isOffline
      }
    }
  },
  methods: {
    // just for development
    switch_offline() {
      this.$store.commit("dev_switch_offline")
    },
    disconnected() {
      if (this.is_standalone) {
        this.get_offline_data().then(async (data) => {
          this.$store.commit("domain/add_domains_data", data.domain_data.map(d_name_data => d_name_data[1]))
          await this.persist_for_offline_mode()
        })
      }
    },
    clear_entries() {
      const entries = this.$store.getters["entries/all_entries_array"]()
      const keep_uuids = this.apply_filter(this.get_status_filter(), entries).map(e => e.uuid)
      const delete_uuids = entries.map(e => e.uuid).filter(uuid => !keep_uuids.includes(uuid))
      this.$store.commit("entries/delete_entries", delete_uuids)
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
      const domain_data = await this.$localforage.getItem("domains")
      if (domain_data) {
        this.$store.commit("domain/set_from_storage", domain_data)
      }

      const templates_data = await this.$localforage.getItem("templates")
      if (templates_data) {
        this.$store.commit("templates/set_from_storage", templates_data)
      }

      const messages = await this.$localforage.getItem("messages")
      if (messages) {
        for (let lang in messages) {
          this.$i18n.setLocaleMessage(lang, messages[lang])
        }
        this.$store.commit("set_available_languages", Array.from(Object.keys(messages)))
      }

      const user_data = await this.$localforage.getItem("user_data")
      if (user_data) {
        this.$store.commit("user/set_user_data", user_data)
      }

      const user_settings = await this.$localforage.getItem("user_settings")
      if (user_settings) {
        this.$store.commit("user/set_settings", user_settings)
      }

      const offline_misc_data = await this.$localforage.getItem("offline_misc_data")
      if (offline_misc_data) {
        await this.$store.dispatch("set_offline_misc_data", offline_misc_data)
      }
    }
  }
}
