import {global_context_filter} from "~/lib/search"
import {USER_LOGGED_IN} from "~/store/user"
import {TEMPLATES_OF_DOMAIN} from "~/store/templates"
import {DOMAIN, DOMAIN_BY_NAME} from "~/store"

import {mapGetters} from "vuex"
import {EDIT, PUBLIC, QP_D, QP_F} from "~/lib/consts"
import EntryCreateMixin from "~/components/entry/EntryCreateMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import {can_edit_entry} from "~/lib/actors"

export default {
  name: "DomainMixin",
  mixins: [EntryCreateMixin, URLQueryMixin],
  props: {
    set_domain_data: Object
  },
  computed: {
    // why user_logged_in
    ...mapGetters({logged_in: USER_LOGGED_IN, all_domains_templates: TEMPLATES_OF_DOMAIN, all_domains: DOMAIN_BY_NAME}),
    domain_name() {
      // todo maybe first a prop...
      return this.$_.get(this.set_domain_data, "name") || this.query_param_domain_name
    },
    domain_templates() {
      return this.all_domains_templates(this.domain_name)
    },
    domain_title() {
      return this.domain_data.title
    },
    domain_data() {
      return this.set_domain_data || this.all_domains(this.domain_name)
    },
    // todo, not sure if used
    template_entries() {
      let templates = global_context_filter(this.domain_templates)
      if (this.main_template) {
        templates = templates.filter(t => t.slug !== this.main_template.slug)
      }
      return templates
    },
    main_template() {
      return this.$_.get(this.domain_data, "templates.main")
      // return this.template_entries.filter(e => e.slug === this.domain_data.page_index.main_template)[0]
    },
    create_templates_options() {
      return this.domain_templates.filter(t => (
        this.$_.get(t, "rules.create", "public") === PUBLIC ||
        can_edit_entry(this.$store.getters.user, t)))
    },
    domain_pre_filter() {
      return [{
        name: "meta",
        column: DOMAIN,
        conditional_value: this.domain_data.name
      }]
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
    can_create_multiple_etypes() {
      return this.create_templates_options.length > 1
    }
  },
  methods: {
    // todo maybe obsolete
    create_from_main_template() {
      const entry = this.create_entry(this.main_template.template_slug)
      this.to_entry(entry.uuid, EDIT)
    }
  }
}
