<template lang="pug">
  div.ml-2
    AspectSet(
      v-if="init_fetched"
      :aspects="setup_aspects"
      :values.sync="setup_values"
      mode="edit"
      @is_complete="is_aspects_complete = $event"
      @aspectAction="aspectAction($event)")
    v-btn(@click="start" :disabled="!is_setup_valid" color="success") {{$t("comp.translate.start")}}
    Dialog(:dialog_open.sync="new_lang_dialog_open")
      h3 {{$t("comp.translate.new.descr")}}
      LanguageSearch(v-model="new_language" :filter_out="exclude_from_search")
      v-btn(@click="add_language" :disabled="!new_language_addable" color="success") {{$t("comp.translate.new.add")}}
      p.mt-2 {{$t("comp.translate.new.get_in_touch")}}
</template>

<script>

import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import Aspect from "~/components/Aspect";
import {extract_n_unpack_values, pack_value} from "~/lib/aspect";
import {PUBLISHED, SELECT} from "~/lib/consts";
import AspectSet from "~/components/AspectSet";
import LanguageSearch from "~/components/language/LanguageSearch";
import Dialog from "~/components/dialogs/Dialog";
import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin";
import EntryCreateMixin from "~/components/entry/EntryCreateMixin";
import ApiHelperMixin from "~/components/ApiHelperMixin";
import {mapGetters} from "vuex";
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin";
import LanguageMixin from "~/components/LanguageMixin";
import {BUS_HIDE_OVERLAY, BUS_OVERLAY} from "~/plugins/bus";
import TranslationSetupMixin from "~/components/language/TranslationSetupMixin";

const components = ["fe", "be", "domain", "entries"]

// todo, doesnt refetch the settings from the store at the right moment
// needs to set them after component is set...
// todo this.entries_options needs to be called again after changing language
export default {
  name: "TranslateSetupComponent",
  components: {Dialog, LanguageSearch, AspectSet, Aspect},
  mixins: [OptionsMixin, TriggerSnackbarMixin, EntryCreateMixin, ApiHelperMixin, TypicalAspectMixin, LanguageMixin, TranslationSetupMixin],
  data() {
    // console.log(this.$store.getters["translate/setup_values"])
    const {component, domain, entry, src_lang, dest_lang} = this.$store.getters["translate/setup_values"]
    return {
      setup_values: {
        component: pack_value(component),
        domain: pack_value(domain),
        entry: pack_value(entry),
        src_lang: pack_value(src_lang),
        dest_lang: pack_value(dest_lang),
        language_active: pack_value()
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
      code_templates_for_domain_lang: [],
      // entries_options: [] // we differentiate null from [], cuz a domain, lang could indeed be empty
      language_statuses: {} // keys: <lang>: <status from server>
    }
  },
  created() {
    this.$bus.$emit(BUS_OVERLAY)
    this.fetch_init_data().then(() => {
      this.init_fetched = true
      this.$bus.$emit(BUS_HIDE_OVERLAY)
    })
  },
  computed: {
    ...mapGetters({translate_setup: "translate/setup_values", ui_language: "ui_language"}),
    setup_aspects() {
      const aspects = [
        this.dest_language_select_aspect(this.dest_language_options), this.component_select_aspect(this.available_components_options),
        this.language_active_aspect,
        this.setup_domain_select_aspect(), this.setup_entry_select_aspect(), this.src_language_select_aspect(this.src_language_options)
      ]
      return aspects
    },
    dest_language_options() {
      return this.all_added_languages.sort()
        .map(l => ({
          value: l,
          text: this.$t(`lang.${l}`),
        })).concat(this.temporary_additional_languages)
    },
    language_active_aspect() {
      // console.log("comp-language_active_aspect")
      return {
        name: "language_active",
        t_label: "comp.translate.lang_status.label",
        t_description: "comp.translate.lang_status.description",
        type: SELECT,
        attr: {
          track_change: true,
          hide_on_disabled: true,
          action: {
            type: "emit",
            name: "change_lang_status",
            trigger: {
              type: "button",
              button_label: "Change state",
              only_on_change: true
            },
          },
          condition: ["and", {
            aspect: "# component",
            value: ["fe", "be"],
            compare: "contains"
          }, {
            aspect: "# dest_lang",
            value: null,
            compare: "unequal"
          }]
        },
        items: [
          {
            value: "active",
            text: this.$t("comp.translate.lang_status.active")
          },
          {
            value: "inactive",
            text: this.$t("comp.translate.lang_status.inactive")
          }
        ]
      }
    },
    available_components_options() {
      return components.map(c => this.create_option(c, this.$t("comp.translate.component_select_asp.options." + c)))
    },
    exclude_from_search() {
      return this.temporary_additional_languages.map(l => l.value).concat(this.all_added_languages)
    },
    new_language_addable() {
      // console.log(this.new_language)
      // console.log(this.temporary_additional_languages)
      if (this.new_language === null)
        return
      return !this.$_.find(this.temporary_additional_languages, l => l.value === this.new_language.value)
    },
    is_setup_valid() {
      return this.is_aspects_complete && this.setup_values.src_lang.value !== this.setup_values.dest_lang.value
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
    setup_domain_select_aspect() {
      const domain_select_aspect = this.domain_select_aspect()
      domain_select_aspect.items.forEach(d => {
        const meta_info = this.domains_metainfos[d.value]
        if (meta_info.active_languages.includes(this.unpacked_values.dest_lang))
          d.description = "completed"
        else if (meta_info.inactive_languages.includes(this.unpacked_values.dest_lang))
          d.description = "incomplete"
        else
          d.description = "not started"
      })
      return domain_select_aspect
    },
    setup_entry_select_aspect() {
      // console.log("comp-entry_select_aspect")
      let options = []
      const {domain: domain_name, dest_lang} = this.unpacked_values
      if (domain_name) {
        const {required_entries} = this.domains_metainfos[domain_name]
        options = Object.values(this.code_templates_for_domain_lang).map(e => {
          const res = {value: e.slug, text: e.title}
          if (e.language === dest_lang) {
            if (e.status === PUBLISHED) {
              res.description = "complete"
            } else {
              res.description = "incomplete"
            }
          } else {
            res.description = "not started"
            if (e.language !== this.ui_language) {
              res.language = e.language
            }
          }
          if (required_entries.includes(e.slug))
            res.mdi_icon = "mdi-exclamation"
          return res
        })
        options = this.$_.sortBy(options, e => e.mdi_icon)
      } else {
        options = []
      }
      return this.entry_select_aspect(options)
    },
    async fetch_init_data() {
      let [res_domain_metainfo, res_entries_info, res_all_languages] = await Promise.all([
        this.$api.domain.meta_info(),
        this.$api.entries.get_codes_templates(this.ui_language, false),
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
        await this.start_message_component(setup)
      } else if (component === "domain") {
        await this.start_domain(domain, setup, src_lang, dest_lang)
      } else if (component === "entries") {
        await this.start_entry(entry, setup)
      }
      setup.messages.forEach(m => {
        if (m[2] === null) {
          m[2] = ""
        }
      })
      // console.log("done")
      // todo, actually all already downloaded fe languages need to be updated
      this.$store.commit("translate/setup", setup)
      await this.$router.push("/translate/translate")
    },
    async start_message_component(setup) {
      const {component, src_lang, dest_lang} = this.unpacked_values
      if (!this.all_added_languages.includes(dest_lang)) {
        await this.$api.language.add_language(dest_lang)
        const {data} = await this.$api.language.get_component(component, [src_lang, dest_lang], false)
        setup.messages = data
      } else {
        const {data} = await this.$api.language.get_component(component, [src_lang, dest_lang], false)
        setup.messages = data
      }
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
        setup.messages = this.match_messages(resp_src_data.data.data, resp_dest_data.data.data)
        Object.assign(setup, {config: {domain, new_o: false}})
      } else { // destination language doesnt exist yet for the domain
        const {data} = await this.$api.domain.domain_content_as_index_table(domain, src_lang)
        // add an empty string for the dest_lang
        data.data.forEach(m => m.push(""))
        Object.assign(setup, {messages: data.data, config: {domain, new_o: true}})
      }
    },
    async start_entry(entry, setup) {
      // console.log(entry)
      // console.log(setup)
      // console.log(this.code_templates_for_domain_lang)
      const code_template = this.code_templates_for_domain_lang[entry]
      // console.log(code_template.language === this.unpacked_values.dest_lang)
      if (code_template.language === this.unpacked_values.dest_lang) {
        const [resp_src_data, resp_dest_data] = await Promise.all([
          this.$api.entry.aspects_as_index_table(entry, setup.src_lang),
          this.$api.entry.aspects_as_index_table(entry, setup.dest_lang)
        ])
        setup.messages = this.match_messages(resp_src_data.data.data, resp_dest_data.data.data)
        Object.assign(setup, {config: {entry, new_o: false}})
      } else {
        const {data} = await this.$api.entry.aspects_as_index_table(entry, setup.src_lang)
        data.data.forEach(m => m.push(""))
        Object.assign(setup, {messages: data.data, config: {entry, new_o: true}})
      }
    },
    async get_language_status(language) {
      if (!this.language_statuses.hasOwnProperty(language)) {
        try {
          const {data: resp} = await this.$api.language.language_status(language)
          this.language_statuses[language] = resp.data
          return Promise.resolve(resp.data.active ? "active" : "inactive")
          // console.log("language_statuses", this.language_statuses)
          // console.log(this.setup_values, pack_value(resp.data.active ? "active" : "inactive"))
        } catch (err) {
          console.log(err)
          this.err_error_snackbar(err)
        }
      } else {
        return Promise.resolve(this.language_statuses[language].active ? "active" : "inactive")
      }
    },
    open_new_lang() {
      this.new_language = null
      this.new_lang_dialog_open = true
    },
    add_language() {
      this.temporary_additional_languages.push(this.new_language)
      this.new_lang_dialog_open = false
      this.$i18n.mergeLocaleMessage(this.ui_language,
        {[`lang.${this.new_language.value}`]: this.new_language.text})
      this.setup_values.dest_lang = this.new_language
    },
    aspectAction(event) {
      if (event.name === "new_lang_dialog") {
        this.open_new_lang()
      } else if (event.name === "change_lang_status") {
        const {dest_lang: lang_code, language_active: active} = this.unpacked_values
        this.$api.language.change_language_status(lang_code, active === "active").then(({data: res}) => {
          const new_state = res.data.active
          this.language_statuses[lang_code].active = new_state
          this.ok_response_snackbar(res)
          if (this.$store.getters.ui_language === lang_code && !new_state) {
            console.log("active lang in ui")
            this.change_language(this.default_language, true, null, true)
          }
          if (new_state) {
            this.$store.commit("add_language", lang_code)
          } else {
            this.$store.commit("remove_language", lang_code)
          }
        })
      }
      // todo after execution
      if (event.requires_callback) {
        this.$bus.$emit("aspect-action-done", {name: event.name})
      }
    },
    add_code_templates(domain, language, entries) {
      console.log("add", domain, language, entries)
      if (!this.codes_templates_minimal_info.hasOwnProperty(domain)) {
        this.codes_templates_minimal_info[domain] = {}
      }
      const slug_map = this.$_.keyBy(entries, "slug")
      this.codes_templates_minimal_info[domain][language] = slug_map
      this.code_templates_for_domain_lang = slug_map
    },
    match_messages(src_messages, dest_messages) {
      const dest_map = new Map(dest_messages)
      const result = []
      for (let src_word of src_messages) {
        let dest_w = dest_map.get(src_word[0])
        if (!dest_w)
          dest_w = ""
        result.push([src_word[0], src_word[1], dest_w])
      }
      return result
    },
    re_calc_entries_for_domain(domain, dest_lang) {
      /**
       * called whenever component is set to "entries" domain changes, or dest_lang changed
       */
      const loaded_infos = this.$_.get(this.codes_templates_minimal_info, `${domain}.${dest_lang}`, null)
      // console.log("recalc", domain, dest_lang)
      // console.log(loaded_infos)
      if (!this.get_entries_info && !loaded_infos) {
        this.get_entries_info = true
        this.code_templates_for_domain_lang = []
        this.$api.domain.get_codes_templates(domain, dest_lang, false).then(({data}) => {
          this.add_code_templates(domain, dest_lang, data.data)
        }, err => {
          console.error(err)
        }).finally(() => {
          this.get_entries_info = false
        })
      } else {
        this.code_templates_for_domain_lang = loaded_infos
      }
    }
  },
  watch: {
    '$store.state.user.settings.ui_language': async function (ui_language) {
      // console.log(ui_language)
      this.$api.entries.get_codes_templates(ui_language).then(({data}) => {
        // console.log(data)
        this.all_entries_in_ui_lang = data.data
      }, err => {
        console.log(err)
      })
    },
    unpacked_values: async function (new_vals, old_vals) {
      // console.log("watch-unpacked_values")
      if (this.$_.isEqual(new_vals, old_vals)) {
        // console.log("watch-unpacked_values-xxx")
        return
      }
      const {component, domain, dest_lang} = new_vals
      for (let a of Object.keys(new_vals)) {
        // console.log(a)
        if (new_vals[a] !== old_vals[a]) {
          if (a === "language_active")
            return
          if (a === "component") {
            this.setup_values["src_lang"] = pack_value()
            if (["fe", "be"].includes(component) && dest_lang) {
              const {dest_lang: lang} = new_vals
              // console.log("check language statuses", this.language_statuses, lang)
              const status = await this.get_language_status(lang)
              this.setup_values.language_active = pack_value(status)
            } else if (component === "entries") {
              if (component === "entries" && domain !== null && dest_lang !== null) {
                this.re_calc_entries_for_domain(domain, dest_lang)
              }
            }
          } else if (a === "domain") {
            if (component === "entries" && domain !== null && dest_lang !== null) {
              this.re_calc_entries_for_domain(domain, dest_lang)
            }
          } else if (a === "dest_lang") {
            // console.log("dest_lang-language_statuses", this.language_statuses)
            if (["fe", "be"].includes(component)) {
              const status = await this.get_language_status(dest_lang)
              this.setup_values.language_active = pack_value(status)
            } else if (component === "entries" && domain !== null && dest_lang !== null) {
              this.re_calc_entries_for_domain(domain, dest_lang)
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
