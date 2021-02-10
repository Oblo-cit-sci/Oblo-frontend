<template lang="pug">
  div.ml-2
    AspectSet(
      v-if="init_fetched"
      :aspects="setup_aspects"
      :values.sync="setup_values"
      mode="edit"
      @is_complete="is_aspects_complete = $event"
      @aspectAction="aspectAction($event)"
      :include_validation="true")
    v-btn(@click="start" :disabled="!is_setup_valid" color="success") {{$t("comp.translate.start")}}
    Dialog(:dialog_open.sync="new_lang_dialog_open")
      h3 {{$t("comp.translate.new.descr")}}
      LanguageSearch(v-model="new_language")
      v-btn(@click="add_language" :disabled="!new_language" color="success") {{$t("comp.translate.start")}}
      p.mt-2 {{$t("comp.translate.new.get_in_touch")}}
</template>

<script>

import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import Aspect from "~/components/Aspect";
import {extract_n_unpack_values, pack_value, unpack} from "~/lib/aspect";
import {PUBLISHED, SELECT} from "~/lib/consts";
import AspectSet from "~/components/AspectSet";
import LanguageSearch from "~/components/language/LanguageSearch";
import Dialog from "~/components/dialogs/Dialog";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";
import EntryCreateMixin from "~/components/entry/EntryCreateMixin";
import ApiHelperMixin from "~/components/ApiHelperMixin";
import {object_list2options} from "~/lib/options";
import {mapGetters} from "vuex";

const components = ["fe", "be", "domain", "entries"]

// todo, doesnt refetch the settings from the store at the right moment
// needs to set them after component is set...
// todo this.entries_options needs to be called again after changing language
export default {
  name: "TranslateSetupComponent",
  components: {Dialog, LanguageSearch, AspectSet, Aspect},
  mixins: [OptionsMixin, TriggerSnackbarMixin, EntryCreateMixin, ApiHelperMixin],
  data() {
    const {component} = this.$store.getters["translate/setup_values"]
    return {
      setup_values: {
        component: pack_value(component),
        entry: pack_value(),
        src_lang: pack_value(),
        dest_lang: pack_value()
      },
      init_fetched: false,
      domains_metainfos: {},
      all_added_languages: [],
      is_aspects_complete: false,
      new_lang_dialog_open: false,
      new_language: null,
      temporary_additional_languages: [],
      codes_templates_minimal_info: {}, // keys: domain,language,slug, ...
      //debounced_entries_search: this.$_.debounce(this.code_template_search, 200),
      all_entries_in_ui_lang: [],
      get_entries_info: false,
      code_templates_for_domain_lang: []
      // entries_options: [] // we differentiate null from [], cuz a domain, lang could indeed be empty
    }
  },
  created() {
    this.$bus.$emit("overlay")
    this.fetch_init_data().then(() => {
      this.init_fetched = true
      this.$bus.$emit("hide-overlay")
    })
    //this.debounced_entries_search = this.$_.debounce(this.code_template_search, 200)
  },
  computed: {
    ...mapGetters({translate_setup: "translate/setup_values", ui_language: "user/settings_ui_language"}),
    setup_aspects() {
      return [
        this.dest_language_select_aspect, this.component_select_aspect,
        this.domain_select_aspect, this.entry_select_aspect, this.src_language_select_aspect
      ]
    },
    dest_language_select_aspect() {
      const base = "comp.translate.dest_lang."
      return {
        name: "dest_lang",
        type: SELECT,
        attr: {
          force_view: "list",
          action: {
            type: "emit",
            name: "new_lang_dialog",
            trigger: {
              type: "button",
              button_always_enabled: true,
              button_label: this.$t("comp.translate.new.new_lang"),
              requires_callback: false
            }
          }
        },
        label: this.$t(`${base}label`),
        description: this.$t(`${base}descr`),
        items: this.dest_language_options
      }
    },
    dest_language_options() {
      return this.all_added_languages.sort()
        .map(l => ({
          value: l,
          text: this.$t(`lang.${l}`),
        })).concat(this.temporary_additional_languages)


      // const component = this.unpacked_values.component
      // let options = []
      // if (component === "domain") {
      //   const domain_info = this.domains_metainfos[this.unpacked_values.domain]
      //   if (domain_info) {
      //     domain_info.active_languages.sort().map(l => ({
      //       value: l,
      //       text: this.$t(`lang.${l}`),
      //       description: "complete"
      //     })).forEach(o => options.push(o))
      //     domain_info.inactive_languages.sort().map(l => ({
      //       value: l,
      //       text: this.$t(`lang.${l}`),
      //       description: "incomplete"
      //     })).forEach(o => options.push(o))
      //     const includes_codes = options.map(l => l.value)
      //     this.all_added_languages.filter(l => !includes_codes.includes(l))
      //       .map(l => ({
      //         value: l,
      //         text: this.$t(`lang.${l}`),
      //         description: "not started"
      //       })).forEach(o => options.push(o))
      //     // console.log(options, this.unpacked_values.dest_lang)
      //   }
      // } else if (["fe", "be"].includes(component)) {
      //   options = this.all_added_languages.sort()
      //     .map(l => ({
      //       value: l,
      //       text: this.$t(`lang.${l}`),
      //     }))
      //     .filter(o => o.value !== this.unpacked_values.src_lang)
      // } else {
      // }
      // return options.filter(o => o.value !== this.unpacked_values.src_lang)
    },
    component_select_aspect() {
      return {
        name: "component",
        type: SELECT,
        attr: {
          hide_on_disabled: true,
          condition: {
            aspect: "# dest_lang",
            compare: "unequal",
            value: null
          }
        },
        label: this.$t("comp.translate.component_select_asp.label"),
        description: this.$t("comp.translate.component_select_asp.description"),
        items: this.available_components_options
      }
    },
    available_components_options() {
      return components.map(c => this.create_option(c, this.$t("comp.translate.component_select_asp.options." + c)))
    },
    domain_select_aspect() {
      const l = this.$store.getters["user/settings_ui_language"]
      const domains = this.$_.cloneDeep(this.$store.getters["domain/domains_for_lang"](l, true))
      domains.forEach(d => {
        const meta_info = this.domains_metainfos[d.name]
        // console.log(meta_info, this.unpacked_values.dest_lang)
        // console.log(meta_info.active_languages.includes[this.unpacked_values.dest_lang])
        if (meta_info.active_languages.includes(this.unpacked_values.dest_lang))
          d.description = "completed"
        else if (meta_info.inactive_languages.includes(this.unpacked_values.dest_lang))
          d.description = "incomplete"
        else
          d.description = "not started"
      })
      // console.log(domains)
      const domain_items = object_list2options(domains, "title", "name", true, ["description"])
      // console.log(domain_items)
      // for (let dmi of domain_items) {
      //   dmi.description = "cool"
      // }
      return {
        name: "domain",
        type: SELECT,
        attr: {
          hide_on_disabled: true,
          condition: {
            aspect: "# component",
            value: ["domain", "entries"],
            compare: "contains"
          }
        },
        label: this.$t("w.domain"),
        items: domain_items
      }
    },
    entry_select_aspect() {
      let options = []
      // console.log("e-sel-asp")
      const {domain: domain_name} = this.unpacked_values
      // console.log(domain_name)
      if (domain_name) {
        let entries = this.all_entries_in_ui_lang.filter(e => e.domain === domain_name)
        const domain = this.$store.getters["domain/domain_by_name"](domain_name)
        const required_entries = domain.langs[Object.keys(domain.langs)[0]].required_entries || []
        // todo here something about their status
        entries.forEach(e => {
          if (required_entries.includes(e.slug))
            e.mdi_icon = "mdi-exclamation"
          if (this.code_templates_for_domain_lang.hasOwnProperty(e.slug)) {
            if (this.code_templates_for_domain_lang[e.slug].status === PUBLISHED) {
              e.description = "complete"
            } else {
              e.description = "incomplete"
            }
          } else {
            e.description = "not started"
          }
        })

        entries = this.$_.sortBy(entries, e => e.mdi_icon)
        options = object_list2options(entries,
          "title", "slug", true, ["mdi_icon", "description"])
      } else {
        options = []
      }
      return {
        name: "entry",
        type: SELECT,
        attr: {
          hide_on_disabled: true,
          force_view: "list",
          condition: {
            aspect: "# component",
            value: "entries"
          }
        },
        label: this.$t("comp.translate.entry_select_asp.label"),
        description: this.$t("comp.translate.entry_select_asp.description"),
        items: options// this.entry_select_items(entries) // EntryCreateMixin
      }
    },
    is_setup_valid() {
      return this.is_aspects_complete && this.setup_values.src_lang.value !== this.setup_values.dest_lang.value
    },
    src_language_select_aspect() {
      // console.log("src lang", this.unpacked_values.component)
      const base = "comp.translate.src_lang."
      // console.log("store", this.translate_setup.src_lang)
      return {
        name: "src_lang",
        type: SELECT,
        label: this.$t(`${base}label`),
        description: this.$t(`${base}descr`),
        items: this.src_language_options,
      }
    },
    src_language_options() {
      const component = this.unpacked_values.component
      let language_options = []
      if (["domain", "entries"].includes(component)) {
        const domain_info = this.domains_metainfos[this.unpacked_values.domain]
        // console.log("domain_info", domain_info)
        if (domain_info) {
          language_options = domain_info.active_languages.sort().map(l => this.create_option(l, this.$t(`lang.${l}`)))
        } else {

        }
      } else if (["fe", "be"].includes(component)) {
        language_options = this.all_added_languages.sort()
          .map(l => ({
            value: l,
            text: this.$t(`lang.${l}`),
          }))
      } else {
      }
      return language_options.filter(o => o.value !== this.unpacked_values.dest_lang)
    },
    disable_init() {
      return true
    },
    unpacked_values() {
      return extract_n_unpack_values(this.setup_values)
    },
  },
  methods: {
    async fetch_init_data() {
      let [res_domain_metainfo, res_entries_info, res_all_languages] = await Promise.all([
        this.$api.domain.meta_info(),
        this.$api.entries.get_codes_templates(this.$store.getters["user/settings_ui_language"]),
        this.$api.language.all_added_languages()])
      this.domains_metainfos = res_domain_metainfo.data
      this.all_entries_in_ui_lang = res_entries_info.data.data
      this.all_added_languages = res_all_languages.data.languages.sort()
      return Promise.resolve()
    },
    async start() {
      const {component, src_lang, dest_lang, domain, entry} = this.unpacked_values
      const setup = {component, domain, src_lang, dest_lang, unpacked: this.setup_values}
      if (["be", "fe"].includes(component)) {
        const {data} = await this.$api.language.get_component(component, [src_lang, dest_lang], false)
        setup.messages = data
      } else if (component === "domain") {
        await this.start_domain(domain, setup, src_lang, dest_lang)
      } else if (component === "entries") {
        await this.start_entry(entry, setup)
      }
      console.log("done")
      this.$store.commit("translate/setup", setup)
      await this.$router.push("/translate/translate")
    },
    async start_domain(domain, setup, src_lang, dest_lang) {
      // todo remove src_lang, dest_lang since we get setup...
      // todo inactive doesnt mean it should not be fetched
      // await this.guarantee_domain_language(domain, src_lang)
      // both languages already have a domain object on the server
      const domain_info = this.domains_metainfos[domain]
      const all_domain_languages = domain_info.active_languages.concat(domain_info.inactive_languages)
      if (all_domain_languages.includes(dest_lang)) {
        const [resp_src_data, resp_dest_data] = await Promise.all([
          this.$api.domain.domain_content_as_index_table(domain, src_lang),
          this.$api.domain.domain_content_as_index_table(domain, dest_lang)
        ])
        setup.messages = resp_src_data.data.data
        const dest_messages = resp_dest_data.data.data
        // console.log(setup.messages)
        // console.log(dest_messages)
        for (let i in setup.messages) {
          setup.messages[i].push(dest_messages[i][1])
        }
        // console.log(setup.messages)
        Object.assign(setup, {config: {domain, new_o: false}})
      } else { // destination language doesnt exist yet for the domain
        const {data} = await this.$api.domain.domain_content_as_index_table(domain, src_lang)
        // add an empty string for the dest_lang
        data.data.forEach(m => m.push(""))
        Object.assign(setup, {messages: data.data, config: {domain, new_o: true}})
      }
    },
    async start_entry(entry, setup) {
      console.log(entry)
      console.log(setup)
      console.log(this.code_templates_for_domain_lang)
      const entry_in_lang = this.code_templates_for_domain_lang[entry]
      if (entry_in_lang) {
        const [resp_src_data, resp_dest_data] = await Promise.all([
          this.$api.entry.aspects_as_index_table(entry, setup.src_lang),
          this.$api.entry.aspects_as_index_table(entry, setup.dest_lang)
        ])
        setup.messages = resp_src_data.data.data
        const dest_messages = resp_dest_data.data.data
        // console.log(setup.messages)
        // console.log(dest_messages)

        // todo something like this (for domain also)
        // tho this comes from errors in the backend. lang entries, miss something, but its ognored
        // check and fill up missing (by index)
        // console.log(setup.messages.length, dest_messages.length)
        // const src_set = new Set(setup.messages.map(m => m[0]))
        // const dest_set = new Set(dest_messages.map(m => m[0]))
        //
        // for (let index of src_set) {
        //   if (!dest_set.has(index)) {
        //     console.log("missing", index)
        //   }
        // }
        // for (let index of dest_set) {
        //   if (!src_set.has(index)) {
        //     console.log("addition", index)
        //   }
        // }

        for (let i in setup.messages) {
          setup.messages[i].push(dest_messages[i][1])
        }

        Object.assign(setup, {config: {entry, new_o: false}})
      } else {
        const {data} = await this.$api.entry.aspects_as_index_table(entry, setup.src_lang)
        data.data.forEach(m => m.push(""))
        Object.assign(setup, {messages: data.data, config: {entry, new_o: true}})
      }
    },
    new_lang() {
      this.new_lang_dialog_open = true
    },
    add_language() {
      if (["fe", "be"].includes(this.unpacked_values.component)) {
        this.$api.language.add_language(this.new_language.value).then(({data}) => {
          this.ok_snackbar(data.msg)
          this.new_lang_dialog_open = false
          this.temporary_additional_languages.push(this.new_language)
        }, err => {
          this.err_error_snackbar(err)
        })
      } else {
        this.temporary_additional_languages.push(this.new_language)
      }
    },
    aspectAction(event) {
      if (event.name === "new_lang_dialog") {
        this.new_lang()
      }
      // todo after execution
      if (event.requires_callback) {
        this.$bus.$emit("aspect-action-done", {name: event.name})
      }
    },
    add_code_templates(domain, language, entries) {
      if (!this.codes_templates_minimal_info.hasOwnProperty(domain)) {
        this.codes_templates_minimal_info[domain] = {}
      }
      const slug_map = this.$_.keyBy(entries, "slug")
      this.codes_templates_minimal_info[domain][language] = slug_map
      this.code_templates_for_domain_lang = slug_map
    }
  },
  watch: {
    '$store.state.user.settings.ui_language': async function (ui_language) {
      console.log(ui_language)
      this.$api.entries.get_codes_templates(this.$store.getters["user/settings_ui_language"]).then(({data}) => {
        console.log(data)
        this.all_entries_in_ui_lang = data.data
      }, err => {
        console.log(err)
      })
    },
    unpacked_values: async function (new_vals, old_vals) {
      const {domain, dest_lang} = new_vals
      if (new_vals.component === "entries" && domain !== null && dest_lang !== null) {

        const loaded_infos = this.$_.get(this.codes_templates_minimal_info, `${domain}.${dest_lang}`, null)
        console.log(loaded_infos)
        if (!this.get_entries_info && !loaded_infos) {
          this.get_entries_info = true
          this.code_templates_for_domain_lang = []
          // console.log(new_vals, dest_lang)
          this.$api.domain.get_codes_templates(domain, dest_lang, false).then(({data}) => {
            this.add_code_templates(domain, dest_lang, data.data)
          }, err => {
            console.error(err)
          }).finally(() => {
            this.get_entries_info = false
          })
        } else if (domain !== old_vals.domain || dest_lang !== old_vals.dest_lang) {
          this.code_templates_for_domain_lang = loaded_infos
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
