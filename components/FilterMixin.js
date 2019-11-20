import {NO_DOMAIN} from "../lib/consts";

export default {
  name: "FilterMixin",
  methods: {
    domain(entries, domains) {
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
    }
  }
}
