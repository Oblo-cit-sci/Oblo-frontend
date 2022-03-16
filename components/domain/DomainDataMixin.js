import EntryCreateMixin from "~/components/entry/EntryCreateMixin";
import {mapGetters} from "vuex";
import {DOMAIN, PUBLIC, USER, VISITOR} from "~/lib/consts";
import {can_edit_entry} from "~/lib/actors";
import FilterMixin from "~/components/FilterMixin";
import URLQueryMixin from "~/components/util/URLQueryMixin";
import {create_options} from "~/lib/template_code_entries"

export default {
  name: "DomainDataMixin",
  props: {
    domain_data: {
      type: Object,
      // required: true
    },
    use_act_domain_lang: {
      type: Boolean,
      default: false
    },
  },
  mixins: [EntryCreateMixin, URLQueryMixin, FilterMixin],
  computed: {
    ...mapGetters({all_domains_templates: "templates/templates_of_domain"}),
    domain_name() {
      return this.domain_data.name
    },
    _domain_data() {
      if (this.use_act_domain_lang) {
        return this.$store.getters["domain/act_lang_domain_data"]
      } else {
        return this.domain_data
      }
    },
    domain_title() {
      return this.domain_data.title
    },
    domain_description() {
      return this.domain_data.description
    },
    create_templates_options() {
      return create_options(this.domain_templates(true),this.$store.getters.user)
      // todo needs refinement, what if this can be changed per user...
      // return this.domain_templates(true).filter(t => {
      //   const create_rule = this.$_.get(t, "rules.create", "public")
      //   return (
      //     create_rule === PUBLIC ||
      //     (create_rule === USER && this.$store.getters["username"] !== VISITOR) ||
      //     can_edit_entry(this.$store.getters.user, t))
      // })
    },
    can_create_multiple_etypes() {
      return this.create_templates_options.length > 1
    },
    domain_image() {
      return this.$api.static.domain_banner(this.domain_name)
    },
    domain_icon() {
      return this.$api.static.domain_icon(this.domain_name)
    },
   // todo not used
    // domain_pre_filter() {
    //   return [this.get_filter_config(DOMAIN, [this.domain_name])]
    // },
    // todo. only used in DomainMenu
    prominent_filters() {
      return this.$_.get(this.domain_data, "filters.prominent_filters")
    },
  },
  methods: {
    domain_templates(include = false) {
      /**
       * include: include those entries which are listed in the 'include_entries' field of the domain-meta.
       * these are templates which are coming from other domains
       */
      const language = this.$store.getters["user/settings"].domain_language
      let domain_templates = this.all_domains_templates(this.domain_name, language)
      if (include) {
        domain_templates = domain_templates.concat(this.$store.getters["templates/templates_by_slugs"](this.domain_data.include_entries || [], language))
      }
      return domain_templates
    },
    domain_templates_slugs(include = false) {
      return this.domain_templates(include).map(t => t.slug)
    }
  }
}
