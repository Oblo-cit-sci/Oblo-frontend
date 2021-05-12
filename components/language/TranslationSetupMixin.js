import {PUBLISHED, SELECT} from "~/lib/consts";
import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin";
import LanguageMixin from "~/components/LanguageMixin";

export default {
  name: "TranslationSetupMixin",
  mixins: [OptionsMixin, TypicalAspectMixin, LanguageMixin],
  computed: {

  },
  methods: {
    dest_language_select_aspect(items) {
      const base = "comp.translate.dest_lang."
      return {
        name: "dest_lang",
        type: SELECT,
        attr: {
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
        items: items
      }
    },
    component_select_aspect() {
      // console.log("comp-component_select_aspect")
      const items = ["fe", "be", "domain", "entries"].map(c => this.create_option(c, this.$t("comp.translate.component_select_asp.options." + c)))
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
        items
      }
    },
    // language_active_aspect() {
    //   // console.log("comp-language_active_aspect")
    //   return {
    //     name: "language_active",
    //     t_label: "comp.translate.lang_status.label",
    //     t_description: "comp.translate.lang_status.description",
    //     type: SELECT,
    //     attr: {
    //       track_change: true,
    //       hide_on_disabled: true,
    //       action: {
    //         type: "emit",
    //         name: "change_lang_status",
    //         trigger: {
    //           type: "button",
    //           button_label: "Change state",
    //           only_on_change: true
    //         },
    //       },
    //       condition: ["and", {
    //         aspect: "# component",
    //         value: ["fe", "be"],
    //         compare: "contains"
    //       }, {
    //         aspect: "# dest_lang",
    //         value: null,
    //         compare: "unequal"
    //       }]
    //     },
    //     items: [
    //       {
    //         value: "active",
    //         text: this.$t("comp.translate.lang_status.active")
    //       },
    //       {
    //         value: "inactive",
    //         text: this.$t("comp.translate.lang_status.inactive")
    //       }
    //     ]
    //   }
    // },
    domain_select_aspect() {
      // console.log("comp-domain_select_aspect")
      return this.asp_domain_select("domain", "w.domain", false, {
        hide_on_disabled: true,
        condition: {
          aspect: "# component",
          value: ["domain", "entries"],
          compare: "contains"
        }
      }, true)
    },
    entry_select_aspect(items) {
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
        items
      }
    },
    src_language_select_aspect(items) {
      const base = "comp.translate.src_lang."
      return {
        name: "src_lang",
        type: SELECT,
        label: this.$t(`${base}label`),
        description: this.$t(`${base}descr`),
        items: items
      }
    },
  }
}
