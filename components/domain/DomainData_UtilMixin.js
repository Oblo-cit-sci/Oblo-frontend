import {mapGetters} from "vuex"
import {TEMPLATES_OF_DOMAIN} from "~/store/templates"
import {EDIT, PUBLIC} from "~/lib/consts"
import {can_edit_entry} from "~/lib/actors"
import EntryCreateMixin from "~/components/entry/EntryCreateMixin";

export default {
  /**
   * THIS MIXIN ASSUMES YOU HAVE THE `domain_data` somehow!
   */
  name: "DomainData_UtilMixin",
  mixins: [EntryCreateMixin],
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
    create_templates_options() {
      // todo needs refinement, what if this can be changed per user...
      return this.domain_templates.filter(t => (
        this.$_.get(t, "rules.create", "public") === PUBLIC ||
        can_edit_entry(this.$store.getters.user, t)))
    },
    can_create_multiple_etypes() {
      return this.create_templates_options.length > 1
    },
    // todo can go to DomainMixin
    image() {
      return this.$api.static_url_$domain_name_banner(this.domain_name)
    },
    icon() {
      return this.$api.static_url_$domain_name_icon(this.domain_name)
    }
  },
  methods: {}
}
