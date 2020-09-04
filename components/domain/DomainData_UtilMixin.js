import {mapGetters} from "vuex"
import {TEMPLATES_OF_DOMAIN} from "~/store/templates"
import {EDIT, PUBLIC} from "~/lib/consts"
import {can_edit_entry} from "~/lib/actors"

export default {
  name: "DomainData_UtilMixin",
  computed: {
    ...mapGetters({all_domains_templates: TEMPLATES_OF_DOMAIN}),
    domain_name() {
      return this.domain_data.name
    },
    title() {
      return this.domain_data.title
    },
    description() {
      return this.domain_data.description
    },
    domain_templates() {
      return this.all_domains_templates(this.domain_name)
    },
    main_template() {
      return this.$_.get(this.domain_data, "templates.main")
    },
    can_create_multiple_etypes() {
      return this.create_templates_options.length > 1
    },
    create_templates_options() {
      return this.domain_templates.filter(t => (
        this.$_.get(t, "rules.create", "public") === PUBLIC ||
        can_edit_entry(this.$store.getters.user, t)))
    },
    // todo can go to DomainMixin
    image() {
      return this.$api.static_url_$domain_name_banner(this.domain_name)
    },
    icon() {
      return this.$api.static_url_$domain_name_icon(this.domain_name)
    }
  },
  methods: {
    create_from_main_template() {
      const entry = this.create_entry(this.main_template.template_slug)
      this.to_entry(entry.uuid, EDIT)
    }
  }
}
