import {USER_LOGGED_IN} from "~/store/user"
import {TEMPLATES_OF_DOMAIN} from "~/store/templates"

import {mapGetters} from "vuex"
import EntryCreateMixin from "~/components/entry/EntryCreateMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import FilterMixin from "~/components/FilterMixin"

export default {
  name: "DomainMixin",
  mixins: [EntryCreateMixin, URLQueryMixin, FilterMixin],
  props: {
    // set_domain_data: Object
  },
  computed: {
    // why user_logged_in
    ...mapGetters({logged_in: USER_LOGGED_IN, all_domains_templates: TEMPLATES_OF_DOMAIN, all_domains: "domain/domain_by_name"}),
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
    domain_language_tags() {
      const domain_lang_codes = this.domain_data.languages
      return domain_lang_codes.map(lang => this.$t("lang."+lang))

      // const language_names = this.$_.keyBy(this.$store.getters["get_code"]("languages")
      //   .values.values.filter(lang => domain_lang_codes.includes(lang.code)), "code")
      // const languages = domain_lang_codes.map(lang_code => language_names[lang_code].name)
      // console.log(languages)
      // return languages //domain_lang_codes.map()
    },

  },
  methods: {
    // todo maybe obsolete

  }
}
