import {mapGetters} from "vuex"

export default {
  name: "EditorConfigMixin",
  computed: {
    editor_config() {
      return this.$store.getters["user/config"].editor || {}
    }
  },
  methods: {
    is_admin() {
      return this.$store.getters["user/is_admin"]
    },
    is_editor_for_language(language) {
      return (this.editor_config.language || []).includes(language)
    },
    is_editor_for_domain(domain_name) {
      return (this.editor_config.domain || []).includes(domain_name)
    },
    is_editor_for_language_o_admin(language) {
      if (this.is_admin())
        return true
      return (this.editor_config.language || []).includes(language)
    },
    is_editor_for_domain_o_admin(domain_name) {
      if (this.is_admin())
        return true
      return (this.editor_config.domain || []).includes(domain_name)
    }
  }
}
