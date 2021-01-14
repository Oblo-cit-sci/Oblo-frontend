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
      const templates = this.domain_templates.filter(t => (
        this.$_.get(t, "rules.create", "public") === PUBLIC ||
        can_edit_entry(this.$store.getters.user, t)))
      // console.log(templates)
      return templates
    },
    can_create_multiple_etypes() {
      return this.create_templates_options.length > 1
    },
    // todo can go to DomainMixin
    image() {
      return this.$api.static.domain_banner(this.domain_name)
    },
    icon() {
      return this.$api.static.domain_icon(this.domain_name)
    },
    domain_pre_filter() {
      return [this.get_domain_filter(this.domain_name)]
    },
    prominent_filters() {
      return this.$_.get(this.domain_data, "filters.prominent_filters")
    },
  },
  methods: {
    // todo should have the method to set the act domain.
    // todo than also this... :)
    /*
    function setFavicons(favImg){
    let headTitle = document.querySelector('head');
    let setFavicon = document.createElement('link');
    setFavicon.setAttribute('rel','shortcut icon');
    setFavicon.setAttribute('href',favImg);
    headTitle.appendChild(setFavicon);
}
setFavicons('domain-icon');
     */
    // ui_lang_domain_data(domain_name) {
    //   console.log(this.$store.getters["user/settings"].domain_language)
    //   return this.lang_domain_data(domain_name, this.$store.getters["user/settings"].domain_language)
    // },
    // lang_domain_data(domain_name, language_code) {
    //   return this.$store.getters["domain/lang_domain_data"](domain_name, language_code)
    // }
  }
}
