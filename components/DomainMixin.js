
import {mapGetters} from "vuex"
import EntryCreateMixin from "~/components/entry/EntryCreateMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import FilterMixin from "~/components/FilterMixin"

export default {
  name: "DomainMixin",
  mixins: [EntryCreateMixin, URLQueryMixin, FilterMixin],
  computed: {
    // why user_logged_in
    ...mapGetters({logged_in: "user/logged_in", all_domains_templates: "templates/templates_of_domain", all_domains: "domain/domain_by_name"}),
    domain_title() {
      return this.domain_data.title
    },
    domain_data() {
      // todo this doesnt give the language domain_data
      return this.set_domain_data || this.all_domains(this.domain_name)
    },
    domain_pre_filter() {
      return [this.get_domain_filter(this.domain_name)]
    },
  }
}
