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
    domain_select_aspect() {
      // console.log("comp-domain_select_aspect")
      return this.asp_domain_select("domain", "w.domain", false, {
        hide_on_disabled: true,
        condition: {
          aspect: "$.component",
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
            aspect: "$.component",
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
