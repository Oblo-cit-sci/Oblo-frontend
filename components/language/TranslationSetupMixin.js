import {SELECT} from "~/lib/consts";
import OptionsMixin from "~/components/aspect_utils/OptionsMixin";
import TypicalAspectMixin from "~/components/aspect_utils/TypicalAspectMixin";
import LanguageMixin from "~/components/LanguageMixin";
import EditorConfigMixin from "~/components/actor/EditorConfigMixin"

export default {
  name: "TranslationSetupMixin",
  mixins: [OptionsMixin, TypicalAspectMixin, LanguageMixin, EditorConfigMixin],
  computed: {},
  methods: {
    dest_language_select_aspect(items) {
      // console.log("dest_language_select_aspect", languages);
      const base = "comp.translate.dest_lang."

      const aspect = {
        name: "dest_lang",
        type: SELECT,
        attr: {},
        label: this.$t(`${base}label`),
        description: this.$t(`${base}descr`),
        items
      }
      if (this.$store.getters["user/is_admin"]) {
        aspect.attr.action = {
          type: "emit",
          name: "new_lang_dialog",
          trigger: {
            type: "button",
            button_always_enabled: true,
            button_label: this.$t("comp.translate.new.new_lang"),
            requires_callback: false
          }
        }
      }
      return aspect
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
            aspect: "$.dest_lang",
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
          condition: ["and", {
            aspect: "$.dest_lang",
            value: null,
            compare: "unequal"
          }, {
            aspect: "$.component",
            value: "entries"
          }, {
            aspect: "$.domain",
            value: null,
            compare: "unequal"
          }]
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
        attr: {
          condition: [
            "or",
            {
              aspect: "$.component",
              value: ["fe", "be"],
              compare: "contains"
            }, [
              "and",
              {
                aspect: "$.component",
                value: "domain"
              },
              {
                aspect: "$.domain",
                value: null,
                compare: "unequal"
              }
            ], [
              "and",
              {
                aspect: "$.component",
                value: "entries"
              },
              {
                aspect: "$.entry",
                value: null,
                compare: "unequal"
              }
            ]
          ]
        },
        items
      }
    },
  }
}
