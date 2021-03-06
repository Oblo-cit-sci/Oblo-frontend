<template lang="pug">
  div.ml-2
    AspectSet(
      v-if="init_fetched"
      :aspects="setup_aspects"
      :values.sync="setup_values"
      mode="edit"
      @update:state="update_aspect_states($event)"
      @is_complete="is_aspects_complete = $event"
      @aspectAction="aspectAction($event)")
    LoadFileButton(filetype="csv" :label="$t('comp.translate.from_csv')" @fileload="from_csv($event)"
      :btn_props="{disabled:disable_csv_upload, color:'success'}" :style="{float:'left'}")
    v-btn(:disabled="!is_setup_valid"  @click="download_translation_table") {{$t('w.download')}}
      v-icon.ml-2 mdi-download
    v-btn(@click="start"  color='success' :disabled="!is_setup_valid")  {{$t("comp.translate.start")}}
    v-btn(@click="update_lang_entry" :disabled="!updatable" color="success") {{$t("w.update")}}
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
import {
  ASP_ERROR,
  ASP_UNSET,
  BACKEND_COMPONENT, COMPONENT, DEST_LANG,
  DOMAIN,
  ENTRIES,
  FRONTEND_COMPONENT,
  PUBLISHED,
  SELECT, SLUG, SRC_LANG
} from "~/lib/consts";
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
import LoadFileButton from "~/components/util/LoadFileButton";
import ExportMixin from "~/components/global/ExportMixin";
import EditorConfigMixin from "~/components/actor/EditorConfigMixin"

const components = [FRONTEND_COMPONENT, BACKEND_COMPONENT, DOMAIN, ENTRIES]

// todo, doesnt refetch the settings from the store at the right moment
// needs to set them after component is set...
// todo this.entries_options needs to be called again after changing language
export default {
  name: "TranslateSetupComponent",
  components: {LoadFileButton, Dialog, LanguageSearch, AspectSet, Aspect},
  mixins: [OptionsMixin, TriggerSnackbarMixin, EntryCreateMixin, ApiHelperMixin, TypicalAspectMixin, LanguageMixin,
    TranslationSetupMixin, ExportMixin],
  data() {
    const {
      component,
      domain,
      entry,
      src_lang,
      dest_lang,
      language_active
    } = this.$store.getters["translate/packed_values"]
    return {
      setup_values: {
        component: component,
        domain: domain,
        entry: entry,
        src_lang: src_lang,
        dest_lang: dest_lang,
        language_active: language_active
      },
      setup_value_states: {}, // just for disabling the with_csv
      init_fetched: false,
      domains_metainfos: {},
      all_added_languages: [],
      is_aspects_complete: false,
      new_lang_dialog_open: false,
      new_language: null,
      temporary_additional_languages: [],
      codes_templates_minimal_info: {}, // keys: domain,language,slug, ...
      all_entries_in_ui_lang: [],
      get_entries_info: false,
      code_templates_for_domain_lang: [],
      language_statuses: {} // keys: <lang>: <status from server>
    }
  },
  created() {
    this.$bus.$emit(BUS_OVERLAY)
    if (this.unpacked_values.component === ENTRIES) {
      this.re_calc_entries_for_domain(this.unpacked_values.domain, this.unpacked_values.dest_lang)
    }
    this.fetch_init_data().then(() => {
      this.init_fetched = true
      this.$bus.$emit(BUS_HIDE_OVERLAY)
    })
  },
  computed: {
    ...mapGetters({translate_setup: "translate/setup_values", ui_language: "ui_language"}),
    setup_aspects() {
      return [
        this.dest_language_select_aspect(this.dest_lang_options),
        this.component_select_aspect(this.available_components_options),
        this.language_active_aspect,
        this.setup_domain_select_aspect(),
        this.setup_entry_select_aspect(),
        this.src_language_select_aspect(this.src_language_options)
      ]
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
            aspect: "$.component",
            value: [FRONTEND_COMPONENT, BACKEND_COMPONENT],
            compare: "contains"
          }, {
            aspect: "$.dest_lang",
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
    updatable() {
      // console.log(this.unpacked_values)
      const {entry, dest_lang} = this.unpacked_values
      if (entry && dest_lang && this.code_templates_for_domain_lang) {
        // console.log(this.code_templates_for_domain_lang)
        const selected_entry = this.$_.find(this.code_templates_for_domain_lang, e =>
          e.language === dest_lang && e.slug === entry
        )
        if (selected_entry) {
          return selected_entry.template.outdated
        }
        // console.log(selected_entry)
      }
      return false
    },
    is_setup_valid() {
      return this.is_aspects_complete && this.setup_values.src_lang.value !== this.setup_values.dest_lang.value
    },
    disable_csv_upload() {
      for (let aspect in this.setup_value_states) {
        if (aspect === SRC_LANG) {
          continue
        }
        if ([ASP_UNSET, ASP_ERROR].includes(this.setup_value_states[aspect])) {
          return true
        }
      }
      return false
    },
    dest_lang_options() {
      // todo use disabled instead of filter? but doesnt work in domain... :/...
      return this.all_added_languages.concat(this.temporary_additional_languages)
        .filter(l => this.is_editor_for_language_o_admin(l))
        .sort()
        .map(l => ({
          value: l,
          text: this.$t(`lang.${l}`),
        }))
    },
    src_language_options() {
      const component = this.unpacked_values.component
      let language_options = []
      if ([DOMAIN, ENTRIES].includes(component)) {
        const domain_info = this.domains_metainfos[this.unpacked_values.domain]
        // console.log("domain_info", domain_info)
        if (domain_info) {
          language_options = domain_info.active_languages.sort().map(l => this.create_option(l, this.$t(`lang.${l}`)))
        }
      } else if ([FRONTEND_COMPONENT, BACKEND_COMPONENT].includes(component)) {
        language_options = this.all_added_languages.sort()
          .map(l => ({
            value: l,
            text: this.$t(`lang.${l}`),
          }))
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
    update_aspect_states(states) {
      this.setup_value_states = states
    },
    /**
     * disabled language because user is editor but not for language...
     * @param language
     */
    is_language_disabled(language) {
      console.log(this.$store.getters["user/config"])
      // if(this.$store.getters["user/is_editor"]) {
      //   return !this.$store.getters["user/is_editor_for_language"](language)
      // }
    },
    /**
     * download a csv
     * @returns {Promise<void>}
     */
    async download_translation_table() {
      let file_name = this.$store.getters["app/platform_data"].title
      let data = null
      const {component, src_lang, dest_lang} = this.unpacked_values
      const languages = [src_lang, dest_lang]
      if (!this.all_added_languages.includes(dest_lang)) {
        await this.$api.language.add_language(dest_lang)
      }
      if ([FRONTEND_COMPONENT, BACKEND_COMPONENT].includes(component)) {
        const response = await this.$api.language.get_component_as_csv(component, languages)
        file_name += `_${component}__${languages.join("_")}`
        if (response.data) {
          data = response.data
        }
      } else if (component === DOMAIN) {
        const domain_name = this.unpacked_values.domain
        const response = await this.$api.domain.as_csv(domain_name, languages).catch(err => {
          console.error(err)
          this.error_snackbar()
        })
        file_name += `_${domain_name}__${languages.join("_")}`
        if (response.data) {
          data = response.data
        }
      } else if (component === ENTRIES) {
        const slug = this.unpacked_values.entry
        const response = await this.$api.template_code.as_csv(slug, languages)
        file_name += `_${slug}__${languages.join("_")}`
        if (response.data) {
          data = response.data
        }
      }
      if (data) {
        this.download_csv(data, file_name)
      }
    },
    setup_domain_select_aspect() {
      let domain_select_aspect = this.$_.cloneDeep(this.domain_select_aspect())
      domain_select_aspect.items.forEach(d => {
        const meta_info = this.domains_metainfos[d.value]
        if (meta_info.active_languages.includes(this.unpacked_values.dest_lang))
          d.description = this.$t("page.translate.item_status.completed")
        else if (meta_info.inactive_languages.includes(this.unpacked_values.dest_lang))
          d.description = this.$t("page.translate.item_status.incomplete")
        else
          d.description = this.$t("page.translate.item_status.not_started")
        // deactivate if user not not editor for domain
        // d.disabled = !this.is_editor_for_domain(d.value)
      })
      // todo. some weird shit here... we filter because it doesnt want to disable the items (see loop above)
      // results all have disabled set to false. so we filter...
      domain_select_aspect.items = domain_select_aspect.items.filter(d => this.is_editor_for_domain_o_admin(d.value))
      return domain_select_aspect
    },
    setup_entry_select_aspect() {
      let options = []
      const {domain: domain_name, dest_lang} = this.unpacked_values
      if (domain_name) {
        const {required_entries} = this.domains_metainfos[domain_name]
        // debugger
        // console.log(this.code_templates_for_domain_lang)
        options = Object.values(this.code_templates_for_domain_lang).map(e => {
          const res = {value: e.slug, text: e.title}
          if (e.language === dest_lang) {
            if (e.status === PUBLISHED) {
              res.description = this.$t("page.translate.item_status.completed")
            } else {
              res.description = this.$t("page.translate.item_status.incomplete")
            }
          } else {
            res.description = this.$t("page.translate.item_status.not_started")
            if (e.language !== this.ui_language) {
              res.language = e.language
            }
          }
          if (e.template.outdated) {
            res.description +=` - (${this.$t("page.translate.item_status.outdated")})`
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
      if ([FRONTEND_COMPONENT, BACKEND_COMPONENT].includes(component)) {
        await this.start_message_component(setup)
      } else if (component === DOMAIN) {
        await this.start_domain(domain, setup, src_lang, dest_lang)
      } else if (component === ENTRIES) {
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
      const code_template = this.code_templates_for_domain_lang[entry]
      if (code_template.language === this.unpacked_values.dest_lang) {
        const [resp_src_data, resp_dest_data] = await Promise.all([
          this.$api.template_code.aspects_as_index_table(entry, setup.src_lang),
          this.$api.template_code.aspects_as_index_table(entry, setup.dest_lang)
        ])
        setup.messages = this.match_messages(resp_src_data.data.data.messages, resp_dest_data.data.data.messages)
        Object.assign(setup, {config: {entry, new_o: false, outdated: resp_dest_data.data.data.outdated}})
      } else {
        const {data} = await this.$api.template_code.aspects_as_index_table(entry, setup.src_lang)
        data.data.messages.forEach(m => m.push(""))
        Object.assign(setup, {messages: data.data.messages, config: {entry, new_o: true, outdated: data.data.outdated}})
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
    async update_lang_entry() {
      const {component, src_lang, dest_lang, domain, entry} = this.unpacked_values
      const setup = {component, domain, src_lang, dest_lang, unpacked: this.setup_values}
      // const code_template = this.code_templates_for_domain_lang[entry]
      const resp_dest_data = await this.$api.template_code.update_aspects_as_index_table(entry, setup.dest_lang)
      setup.messages = resp_dest_data.data.data.messages
      Object.assign(setup, {config: {entry, new_o: false, outdated: resp_dest_data.data.data.outdated}})
      this.$store.commit("translate/setup", setup)
      await this.$router.push("/translate/update_template")
    },
    open_new_lang() {
      this.new_language = null
      this.new_lang_dialog_open = true
    },
    add_language() {
      /**
       * when added from the dialog
       */
      const new_lang = this.new_language
      this.temporary_additional_languages.push(this.new_language)
      this.new_lang_dialog_open = false
      this.$i18n.mergeLocaleMessage(this.ui_language,
        {[`lang.${new_lang.value}`]: new_lang.text})
      this.setup_values.dest_lang = new_lang
      this.language_statuses[new_lang.value] = {active: false, lang_code: this.new_language.value}
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
      // console.log("add", domain, language, entries)
      if (!this.codes_templates_minimal_info.hasOwnProperty(domain)) {
        this.codes_templates_minimal_info[domain] = {}
      }
      const slug_map = this.$_.keyBy(entries, SLUG)
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
    },
    from_csv(file) {
      const {component, dest_lang} = this.unpacked_values
      if ([FRONTEND_COMPONENT, BACKEND_COMPONENT].includes(component)) {
        this.$api.language.update_messages_from_csv(component, dest_lang, file).then(({data}) => {
          this.ok_snackbar(data.msg)
        }, err => {
          console.error(err)
          this.err_error_snackbar(err)
        })
      } else if (component === DOMAIN) {
        const domain_name = this.unpacked_values.domain
        this.$api.domain.from_csv(domain_name, dest_lang, file).then(({data}) => {
          this.ok_snackbar(data.msg)
          // data.data contains the domain-data if is published
          if (data.data) {
            this.$store.commit("domain/add_domains_data", [data.data])
          }
        }, err => {
          console.error(err)
          this.err_error_snackbar(err)
        })
      } else { // entry
        const entry_slug = this.unpacked_values.entry
        this.$api.template_code.from_csv(entry_slug, dest_lang, file).then(({data}) => {
          this.ok_snackbar(data.msg)
          const entry = data.data
          if (entry.status === PUBLISHED) {
            this.$store.dispatch("templates/add_templates_codes", [entry])
          }
          // this.$store.dispatch("templates/add_templates_codes", [entry])
        }, err => {
          console.error(err)
          this.err_error_snackbar(err)
        })
      }
    }
  },
  watch: {
    '$store.state.user.settings.ui_language': async function (ui_language) {
      // console.log(ui_language)
      // this is quite an heavy endpoint... all entries in the given language
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
          if (a === COMPONENT) {
            this.setup_values[SRC_LANG] = pack_value()
            if ([FRONTEND_COMPONENT, BACKEND_COMPONENT].includes(component) && dest_lang) {
              const {dest_lang: lang} = new_vals
              // console.log("check language statuses", this.language_statuses, lang)
              const status = await this.get_language_status(lang)
              this.setup_values.language_active = pack_value(status)
            } else if (component === ENTRIES) {
              if (component === ENTRIES && domain !== null && dest_lang !== null) {
                this.re_calc_entries_for_domain(domain, dest_lang)
              }
            }
          } else if (a === DOMAIN) {
            if (component === ENTRIES && domain !== null && dest_lang !== null) {
              this.re_calc_entries_for_domain(domain, dest_lang)
            }
          } else if (a === DEST_LANG) {
            // console.log("dest_lang-language_statuses", this.language_statuses)
            if ([FRONTEND_COMPONENT, BACKEND_COMPONENT].includes(component)) {
              const status = await this.get_language_status(dest_lang)
              this.setup_values.language_active = pack_value(status)
            } else if (component === ENTRIES && domain !== null && dest_lang !== null) {
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
