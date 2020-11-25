import EntryCreateMixin from "~/components/entry/EntryCreateMixin";
import {mapGetters} from "vuex";
import {PUBLIC} from "~/lib/consts";
import {can_edit_entry} from "~/lib/actors";
import FilterMixin from "~/components/FilterMixin";
import URLQueryMixin from "~/components/util/URLQueryMixin";

export default {
  name: "DomainDataMixin",
  props: {
    domain_data: {
      type: Object,
      required: true
    }
  },
  mixins: [EntryCreateMixin, URLQueryMixin, FilterMixin],
  computed: {
    ...mapGetters({all_domains_templates: "templates/templates_of_domain"}),
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
      const language = this.$store.getters["user/settings"].domain_language
      return this.all_domains_templates(this.domain_name, language)
    },
    create_templates_options() {
      // todo needs refinement, what if this can be changed per user...
      console.log(this.domain_templates)
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
    },
    domain_pre_filter() {
      return [this.get_domain_filter(this.domain_name)]
    },
    prominent_filters() {
      return this.$_.get(this.domain_data, "filters.prominent_filters")
    },
  },
  methods: {
    // ui_lang_domain_data(domain_name) {
    //   console.log(this.$store.getters["user/settings"].domain_language)
    //   return this.lang_domain_data(domain_name, this.$store.getters["user/settings"].domain_language)
    // },
    // lang_domain_data(domain_name, language_code) {
    //   return this.$store.getters["domain/lang_domain_data"](domain_name, language_code)
    // }
  }
}
