import {DOMAIN} from "~/store"

export default {
  name: "FilterMixin",
  computed: {
    act_config: {
      get: function () {
        return this.$store.getters["search/get_act_config"]
      },
      set: function (val) {
        this.filter_changed = true
        this.$store.commit("search/set_act_config", val)
        this.filter2maplegend(val)
      }
    },
  },
  methods: {
    filter2maplegend(filter_config) {
      const template_filter_conf = filter_config.filter(fc => fc.name === "template")[0]
      this.$store.commit("map/set_filter_config", template_filter_conf.value.map(v => ({
        value: v,
        name: "template"
      })))
    },
    get_filtered_template_slugs() {
      const template_filter_conf = this.act_config.filter(fc => fc.name === "template")[0]
      return this.$_.get(template_filter_conf, "value", [])
    },
    filter_entries_by_domains(entries, domains) {
      // todo check if string instead
      if (domains.constructor !== Array) {
        domains = [domains]
      }

      /*
      todo bring back later, for bringing the basic type, valuelist, ...
      if (include_no_domain) {
        domains = ld.concat(domains, NO_DOMAIN)
      }
      */

      const etype_domain_map = {}
      this.$store.getters.entry_types_array.forEach(et => {
        etype_domain_map[et.slug] = et.domain
      })

      return this.$_.filter(entries, e => {
        return this.$_.includes(domains, etype_domain_map[e.type_slug])
      })
    },
    entrytype(entries, entrytypes) {
      if (entrytypes.constructor !== Array) {
        entrytypes = [entrytypes]
      }

      return this.$_.filter(entries, e => {
        return this.$_.includes(entrytypes, e.type_slug)
      })
    },
    get_domain_filter(domain_name) {
      return {
        name: "meta",
        column: DOMAIN,
        conditional_value: domain_name
      }
    },
    apply_filter(filter, entries) {
      if (filter.name === "domain") {
        return entries.filter(e => e.domain === filter.value)
      }
      if (filter.name === "template") {
        return entries.filter(e => filter.values.includes(e.template.slug))
      }
      if (filter.name === "status") {
        return entries.filter(e => e.status === filter.value)
      }
    }
  }
}
