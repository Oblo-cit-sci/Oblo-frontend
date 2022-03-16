import EntryCreateMixin from "~/components/entry/EntryCreateMixin";
import {mapGetters} from "vuex";
import FilterMixin from "~/components/FilterMixin";
import URLQueryMixin from "~/components/util/URLQueryMixin";
import {create_template_options} from "~/lib/template_code_entries"

export default {
  name: "DomainDataMixin",
  props: {
    use_act_domain_lang: {
      type: Boolean,
      default: true
    },
    domain_data: {
      type: Object
    }
  },
  created() {
    if (!this.use_act_domain_lang) {
      if (!this.domain_data) {
        console.error("DomainDataMixin: domain_data is not defined/ use_act_domain_lang is false")
      }
    }
  },
  computed: {
    ...mapGetters({all_domains_templates: "templates/templates_of_domain"}),
    domain_name() {
      return this.get_domain_data.name
    },
    get_domain_data() {
      if (this.domain_data) {
        return this.domain_data
      } else {
        return this.$store.getters["domain/act_lang_domain_data"]
      }
    },
    create_templates_options() {
      return create_template_options(this.domain_templates(true), this.$store.getters.user)
    },
    can_create_multiple_etypes() {
      return this.create_templates_options.length > 1
    },
    // todo not used
    // domain_pre_filter() {
    //   return [this.get_filter_config(DOMAIN, [this.domain_name])]
    // },
    // todo. only used in DomainMenu
    prominent_filters() {
      return this.$_.get(this.get_domain_data, "filters.prominent_filters")
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
        domain_templates = domain_templates.concat(this.$store.getters["templates/templates_by_slugs"](this.get_domain_data.include_entries || [], language))
      }
      return domain_templates
    },
    domain_templates_slugs(include = false) {
      return this.domain_templates(include).map(t => t.slug)
    }
  }
}
