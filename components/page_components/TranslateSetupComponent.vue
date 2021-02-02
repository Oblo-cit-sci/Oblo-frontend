<template lang="pug">
  div.ml-2
    AspectSet(
      :aspects="setup_aspects"
      :values.sync="setup_values"
      mode="edit"
      @is_complete="is_aspects_complete = $event"
      :include_validation="true")
      template(v-slot:pre_validation)
        v-btn(@click="new_lang") {{$t("comp.translate.new.new_lang")}}
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
import {SELECT} from "~/lib/consts";
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
      domains_metainfos: {},
      all_added_languages: [],
      is_aspects_complete: false,
      new_lang_dialog_open: false,
      new_language: null,
    }
  },
  created() {
    this.$bus.$emit("overlay")
    this.fetch_init_data().then(() => {
      this.$bus.$emit("hide-overlay")
    })
  },
  computed: {
    ...mapGetters({translate_setup: "translate/setup_values"}),
    available_components_options() {
      return components.map(c => this.create_option(c, this.$t("comp.translate.component_select_asp.options." + c)))
    },
    is_setup_valid() {
      return this.is_aspects_complete && this.setup_values.src_lang.value !== this.setup_values.dest_lang.value
    },
    component_select_aspect() {
      return {
        name: "component",
        type: SELECT,
        label: this.$t("comp.translate.component_select_asp.label"),
        description: this.$t("comp.translate.component_select_asp.description"),
        items: this.available_components_options
      }
    },
    domain_select_aspect() {
      const l = unpack(this.$store.getters["user/settings_value"]("ui_language"))
      const domains = this.$store.getters["domain/domains_for_lang"](l, true)
      const domain_items = object_list2options(domains, "title", "name", true)
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
            value: "domain"
          }
        },
        label: this.$t("w.domain"),
        items: domain_items
      }
    },
    entry_select_aspect() {
      const entries = this.$store.getters["templates/templates_of_domain"]("licci", "en")
      // console.log(entries)
      return {
        name: "entry",
        type: SELECT,
        attr: {
          hide_on_disabled: true,
          condition: {
            aspect: "# component",
            value: "entries"
          }
        },
        label: this.$t("comp.translate.entry_select_asp.label"),
        description: this.$t("comp.translate.entry_select_asp.description"),
        items: this.entry_select_items(entries) // EntryCreateMixin
      }
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
        items: this.src_language_options
      }
    },
    dest_language_select_aspect() {
      const base = "comp.translate.dest_lang."
      return {
        name: "dest_lang",
        type: SELECT,
        attr: {
          force_view: "list"
        },
        label: this.$t(`${base}label`),
        description: this.$t(`${base}descr`),
        items: this.dest_language_options
      }
    },
    src_language_options() {
      const component = this.unpacked_values.component
      if (component === "domain") {
        const domain_info = this.domains_metainfos[this.unpacked_values.domain]
        if (domain_info) {
          return domain_info.active_languages.sort().map(l => this.create_option(l, this.$t(`lang.${l}`)))
        }
      } else if (["fe", "be"].includes(component)) {
        return this.all_added_languages.sort()
          .map(l => ({
            value: l,
            text: this.$t(`lang.${l}`),
          }))
      } else {
        return []
      }
    },
    dest_language_options() {
      const component = this.unpacked_values.component
      if (component === "domain") {
        const domain_info = this.domains_metainfos[this.unpacked_values.domain]
        if (domain_info) {
          let options = []
          domain_info.active_languages.sort().map(l => ({
            value: l,
            text: this.$t(`lang.${l}`),
            description: "complete"
          })).forEach(o => options.push(o))
          domain_info.inactive_languages.sort().map(l => ({
            value: l,
            text: this.$t(`lang.${l}`),
            description: "incomplete"
          })).forEach(o => options.push(o))
          const includes_codes = options.map(l => l.value)
          this.all_added_languages.filter(l => !includes_codes.includes(l))
            .map(l => ({
              value: l,
              text: this.$t(`lang.${l}`),
              description: "not started"
            })).forEach(o => options.push(o))
          // console.log(options, this.unpacked_values.dest_lang)
          options = options.filter(o => o.value !== this.unpacked_values.src_lang)
          return options // domain_info.active_languages.sort().map(l => this.create_option(l, this.$t(`lang.${l}`)))
        }
      } else if (["fe", "be"].includes(component)) {
        return this.all_added_languages.sort()
          .map(l => ({
            value: l,
            text: this.$t(`lang.${l}`),
          }))
      } else {
        return []
      }
    },
    setup_aspects() {
      return [this.component_select_aspect, this.domain_select_aspect, this.entry_select_aspect,
        this.src_language_select_aspect, this.dest_language_select_aspect]
    },
    disable_init() {
      return true
    },
    unpacked_values() {
      return extract_n_unpack_values(this.setup_values)
    }
  },
  methods: {
    async fetch_init_data() {
      let [res_domain_metainfo, res_all_languages] = await Promise.all([this.$api.domain.metainfo(), this.$api.language.all_added_languages()])
      this.domains_metainfos = res_domain_metainfo.data
      this.all_added_languages = res_all_languages.data.languages.sort()
      return Promise.resolve()
    },
    async start() {
      const {component, src_lang, dest_lang, domain, entry} = this.unpacked_values
      const setup = {component, src_lang, dest_lang, unpacked: this.setup_values}
      if (["be", "fe"].includes(component)) {
        const {data} = await this.$api.language.get_component(component, [src_lang, dest_lang], false)
        setup.messages = data
      } else if (component === "domain") {
        // todo inactive doesnt mean it should not be fetched
        // await this.guarantee_domain_language(domain, src_lang)
        // both languages already have a domain object on the server
        if (this.domains_metainfos[domain].active_languages.includes(dest_lang)) {
          const [resp_src_data, resp_dest_data] = await Promise.all([
            this.$api.domain.domain_content_as_index_table(domain, src_lang),
            this.$api.domain.domain_content_as_index_table(domain, dest_lang)
          ])
          setup.messages = resp_src_data.data.data
          const dest_messages = resp_dest_data.data.data
          for (let i in setup.messages) {
            setup.messages[i].push(dest_messages[i][1])
          }
          Object.assign(setup, {config: {domain, new_o: false}})
        } else { // destination language doesnt exist yet for the domain
          const {data} = await this.$api.domain.domain_content_as_index_table(domain, src_lang)
          // add an empty string for the dest_lang
          // data.data.forEach(m => m.push(""))
          Object.assign(setup, {messages: data.data, config: {domain, new_o: true}})
        }
      }
      console.log("done")
      this.$store.commit("translate/setup", setup)
      await this.$router.push("/translate/translate")
    },
    new_lang() {
      this.new_lang_dialog_open = true
    },
    add_language() {
      this.$api.language.add_language(this.new_language).then(({data}) => {
        this.ok_snackbar(data.msg)
        this.new_lang_dialog_open = false
      }, err => {
        this.err_error_snackbar(err)
      })
    }
  }
}
</script>

<style scoped>

</style>
