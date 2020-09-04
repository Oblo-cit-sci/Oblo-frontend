import {ALL_CODES, DOMAIN} from "~/store"
import {entries_domain_filter} from "~/lib/search"
import {MULTISELECT, TREEMULTISELECT} from "~/lib/consts"
import {build_tag_select_list, build_tag_select_tree, find_templates_using_code} from "~/lib/codes"

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
        domains = this.$_.concat(domains, NO_DOMAIN)
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
    get_template_filter_options(domain_name) {
      return {
        name: "template",
        t_label: "w.entrytype",
        aspect: {
          name: "template_slug",
          t_label: "w.entrytype",
          type: "multiselect",
          attr: {
            min: 1,
            unpacked: true
          },
          options: []
        },
        search_config: {
          name: "template",
        }
      }
    },
    get_tags_filter_options(domain_name) {
      const all_codes = this.$store.getters[ALL_CODES]
      let filter_codes = Object.values(all_codes).filter(code_entry => code_entry.rules.tags || null)
      if (domain_name) {
        filter_codes = entries_domain_filter(filter_codes, domain_name)
      }
      // console.log(all_codes)
      // filter_codes = object_list2options(filter_codes, "title", "slug")
      const options_aspects = []
      for (let code of filter_codes) {
        const used_in_templates = find_templates_using_code(this.$store, code.slug).map(template => template.title)
        // maybe the options-aspect should not take the label as text
        const base_aspect = {
          name: code.slug,
          text: code.title,
          label: code.title,
          description: "Used in: " + used_in_templates.join(", "),
          attr: {}
        }
        if (code.template.slug === "value_tree") {
          const tag_tree = build_tag_select_tree(this.$_.cloneDeep(code))
          options_aspects.push(Object.assign(base_aspect, {
                type: TREEMULTISELECT,
                items: tag_tree
              })
          )
        } else if (code.template.slug === "value_list") {
          const tag_list = build_tag_select_list(this.$_.cloneDeep(code))
          options_aspects.push(Object.assign(base_aspect, {
                type: MULTISELECT,
                items: tag_list
              })
          )
        } else {
          console.log(`unknown code template for ${code.title}, template slug: ${code.template.slug}`)
        }
      }

      return {
        name: "tags",
        "t_label": "w.tag",
        options: filter_codes.map(c => c.title),
        aspect: {
          name: "tags_select",
          "t_label": "w.tag",
          description: "Start with source-entry for tags. Then select multiple tags that you would like to include in your search. Any entry that includes at least one of the selected tags will be included in the result.",
          type: "options",
          attr: {
            edit_component: "tag_options",
          },
          options: options_aspects
        },
        search_config: {
          include_as: "tags",
          source_name: "regular"
        }
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
    },
    config_generate(filtername, filtervalue) {
      if (filtername === "template") {
        const used_templates = this.$store.getters["templates/entry_types_array"].filter(template => filtervalue.includes(template.slug))
        return {
          "name": "template",
          "t_label": "w.entrytype",
          "value": filtervalue,
          "text": used_templates.map(t => t.title).join(", ")
        }
      }
    }
  }
}
