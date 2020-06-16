import {global_context_filter} from "~/lib/search"
import {USER_LOGGED_IN} from "~/store/user"
import {TEMPLATES_OF_DOMAIN} from "~/store/templates"
import {DOMAIN, DOMAIN_BY_NAME} from "~/store"

import {mapGetters} from "vuex"
import {EDIT, QP_D, QP_F} from "~/lib/consts"
import EntryCreateMixin from "~/components/entry/EntryCreateMixin"

export default {
  name: "DomainMixin",
  mixins: [EntryCreateMixin],
  computed: {
    ...mapGetters({logged_in: USER_LOGGED_IN, domain_templates: TEMPLATES_OF_DOMAIN, domains: DOMAIN_BY_NAME}),
    domain_name() {
      // todo maybe first a prop...
      return this.$route.query[QP_D] || this.$route.query[QP_F]
    },
    domain_data() {
      return this.domains(this.domain_name)
    },
    template_entries() {
      let templates = global_context_filter(this.domain_templates(this.domain_name))
      if (this.main_template) {
        templates = templates.filter(t => t.slug !== this.main_template.slug)
      }
      return templates
    },
    main_template() {
      return this.$_.get(this.domain_data, "templates.main")
      // return this.template_entries.filter(e => e.slug === this.domain_data.page_index.main_template)[0]
    },
    domain_pre_filter() {
      return [{
        name: "meta",
        column: DOMAIN,
        conditional_value: this.domain_data.name
      }]
    }
  },
  methods: {
    create_from_main_template() {
      const entry = this.create_entry(this.main_template.template_slug)
      this.to_entry(entry.uuid, EDIT)
    }
  }
}
