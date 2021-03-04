import {entries_domain_filter} from "~/lib/search"
import {
  ACTOR,
  DOMAIN,
  DRAFT,
  LANGUAGE,
  META,
  MULTISELECT, REQUIRES_REVIEW,
  STATUS,
  TAGS,
  TEMPLATE,
  TREEMULTISELECT
} from "~/lib/consts"
import {build_tag_select_list, build_tag_select_tree, find_templates_using_code} from "~/lib/codes"
import {mapGetters} from "vuex";
import {pack_value, unpack} from "~/lib/aspect";
import {recursive_unpack2} from "~/lib/util";


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
        // this.filter2maplegend(val)
      }
    },
    ...mapGetters({domain_language: "user/settings_domain_language"})
  },
  methods: {
    get_filter_options_by_name(filter_name) {
      switch (filter_name) {
        case [TEMPLATE]:
          return this.get_template_filter_options()
        case [LANGUAGE]:
          return this.get_language_filter_options()
        case [TAGS]:
      }
    },
    get_filtered_template_slugs() {
      const template_filter_conf = this.act_config.filter(fc => fc.name === TEMPLATE)[0]
      return unpack(this.$_.get(template_filter_conf, "value", []))
    },
    entrytype(entries, entrytypes) {
      if (entrytypes.constructor !== Array) {
        entrytypes = [entrytypes]
      }

      return this.$_.filter(entries, e => {
        return this.$_.includes(entrytypes, e.type_slug)
      })
    },
    // todo not really a filter. make them all so they dont require params,...
    get_domain_filter(domain_name) {
      return {
        name: DOMAIN,
        value: domain_name
      }
    },
    get_status_filter(statuses = [DRAFT]) {
      return {
        name: STATUS,
        source_name: "local",
        value: statuses
      }
    },
    get_requires_review_filter() {
      return {
        name: "requires_review",
        t_label: "w.review_required",
        edit: {
          editable: false
        },
        value: [REQUIRES_REVIEW],
        search_config: {
          name: "status",
        },
      }
    },
    get_template_filter_options() {
      return {
        name: "template",
        t_label: "w.entrytype",
        aspect: {
          name: "template_slug",
          t_label: "w.entrytype",
          type: "multiselect",
          attr: {
            min: 1,
          },
        },
        search_config: {
          name: "template",
        }
      }
    },
    get_tags_filter_options(domain_name) {
      const all_codes = this.$store.getters["templates/codes_in_language"](this.domain_language)
      // console.log("all-codes", domain_name, this.domain_language, all_codes.length)
      let filter_codes = all_codes.filter(code_entry => this.$_.get(code_entry, "rules.tags"))
      if (domain_name) {
        filter_codes = entries_domain_filter(filter_codes, domain_name)
      }
      // console.log("all-codes",  filter_codes.length)
      // console.log(all_codes)
      // filter_codes = object_list2options(filter_codes, "title", "slug")
      const options_aspects = []
      for (let code of filter_codes) {
        // console.log("code use", code.slug, this.domain_language)
        const used_in_templates = find_templates_using_code(this.$store, code.slug, this.domain_language).map(template => template.title)
        // console.log("->", used_in_templates)
        // maybe the options-aspect should not take the label as text
        const base_aspect = {
          name: code.slug,
          text: code.title,
          label: code.title,
          description: this.$t("comp.tagoptions_asp.used_in") + used_in_templates.join(", "),
          attr: {}
        }
        if (code.rules.code_schema === "value_tree") {
          const tag_tree = build_tag_select_tree(this.$_.cloneDeep(code))
          options_aspects.push(Object.assign(base_aspect, {
              type: TREEMULTISELECT,
              items: tag_tree
            })
          )
        } else if (code.rules.code_schema === "value_list") {
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
          t_label: "w.tag",
          t_description: "comp.filters.tag.description",
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
    get_language_filter_options(domain_name) {
      const domain_langs = this.$store.getters["domain/get_domain_languages"](domain_name)
      const options = domain_langs.map(lang => ({"value": lang, "text": this.$t("lang." + lang)}))
      return Object.assign(this.language_filter_config(), {
        search_config: {
          name: "language",
        },
        hide_on_value: [this.domain_language],
        aspect: {
          name: "language",
          t_label: "asp.language.label",
          type: "multiselect",
          attr: {
            min: 1
          },
          items: options
        }
      })
    },
    language_filter_config() {
      return {
        name: "language",
        t_label: "asp.language.label",
      }
    },
    get_actor_filter(registered_name) {
      return {
        name: "actor",
        value: registered_name
      }
    },
    apply_filter(filter, entries) {
      const filter_value = unpack(filter.value)
      if (filter.name === "select_uuids") {
        return entries.filter(e => filter.value.includes(e.uuid))
      }
      if (filter.name === "domain") {
        return entries.filter(e => e.domain === filter.value)
      } else if (filter.name === TEMPLATE) {
        // console.log(filter, entries)
        return entries.filter(e => filter_value.includes(e.template.slug))
      } else if (filter.name === STATUS) {
        return entries.filter(e => filter_value.includes(e.status))
      } else if (filter.name === TAGS) {
        return this.apply_tags_filter(filter, entries)
      } else if (filter.name === META) {
        return entries.filter(e => e[filter.column] === filter_value)
      } else if (filter.name === ACTOR) {
        // later replace filter.registered_name with filter.value
        return entries.filter(e => this.$_.some(e.actors, entry_actor => entry_actor.actor.registered_name === filter_value))
      } else if (filter.name === LANGUAGE) {
        return entries.filter(e => filter_value.includes(e.language))
      } else {
        console.log("filter not applicable", filter.name)
        return entries
      }
    },
    // todo maybe use a function template_filter_config... e.g. language_filter_config
    config_generate(filtername, filtervalue, language) {
      /**
       *
       */
      if (filtername === TEMPLATE) {
        // const used_templates = this.$store.getters["templates/entry_types_array"](language, true).filter(template => filtervalue.includes(template.slug))
        // filter out slugs that dont exist. todo maybe something on the server?
        const valid_value = this.validate_filter_value(TEMPLATE, filtervalue)
        return {
          "name": TEMPLATE,
          "t_label": "w.entrytype",
          "value": pack_value(valid_value),
        }
      } else if (filtername === LANGUAGE) {
        return Object.assign(this.language_filter_config(), {value: pack_value(filtervalue)})
      }
    },
    apply_tags_filter(tags_filter, entries) {
      const tag_filter = (e) => {
        for (let tags of Object.values(e.tags)) {
          const included = this.$_.some(tags, t => recursive_unpack2(tags_filter.value).includes(t))
          if (included)
            return true
        }
        return false
      }
      // console.log(tags_filter, entries)
      return entries.filter(tag_filter)
    },
    has_local_filter(filters) {
      return filters.filter(f => f.source_name === "local").length > 0
    },
    validate_filter_value(filter_name, value) {
      if (filter_name === TEMPLATE) {
        const language = this.$store.getters["user/settings_domain_language"]
        return value.filter(val => this.$store.getters["templates/entry_type"](val, language))
      }
    }
  }
}
