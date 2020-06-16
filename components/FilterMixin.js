import {DOMAIN} from "~/store"

export default {
  name: "FilterMixin",
  methods: {
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
    }
  }
}
