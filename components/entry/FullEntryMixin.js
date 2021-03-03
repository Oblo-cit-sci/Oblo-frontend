import {privacy_icon} from "~/lib/util";
import {EDIT, VIEW} from "~/lib/consts";
import {unsaved_changes_default_dialog} from "~/lib/dialogs";
import LanguageMixin from "~/components/LanguageMixin";

export default {
  data() {
    return {
      unsaved_changes_dialog: unsaved_changes_default_dialog,
    }
  },
  props: {
    entry_navigation_props: {
      type: Object,
      default: () => {
      }
    }
  },
  name: "FullEntryMixin",
    mixins: [LanguageMixin],
  computed: {
    mode: {
      get() {
        return this.$route.query.entry_mode || VIEW
      },
      set(mode) {
        if (mode === EDIT) {
          if (this.entry.language !== this.$store.getters.domain_language) {
            this.$bus.$emit("dialog-open", {
              data: {
                cancel_text: this.$t("comp.entry.language_switch_dialog.cancel_text"),
                title: this.$t("comp.entry.language_switch_dialog.title"),
                text: this.$t("comp.entry.language_switch_dialog.text",
                  {language: this.$t("lang." + this.entry.language)})
              },
              cancel_method: () => {
              },
              confirm_method: async () => {
                  await this.change_language(this.entry.language)
                  this.to_entry(this.uuid, mode, {}, false)
                // const template_slug = this.entry.template.slug
                // await this.guarantee_slugs_in_language(this.get_reference_slugs().concat([template_slug]), entry_lang)
                // const has_entry = this.$store.getters["templates/has_template_in_lang"](template_slug, entry_lang)
                // if (has_entry) {
                //   this.force_entry_language = true
                // } else {
                //   this.error_snackbar(this.$t("comp.entry.template_not_in_lang"))
                // }
              }
            })
          }
          else {
              this.to_entry(this.uuid, mode, {}, false)
          }
          //
        }
      }
    },
    meta_aspects_privacy() {
      let result = []
      result.push({icon: privacy_icon(this.entry.privacy), name: this.entry.privacy})
      result.push({name: "License: " + this.entry.license})
      return result
    },
    show_image() {
      return this.entry.image
    }
  }
}
