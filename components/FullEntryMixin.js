
  import {privacy_icon} from "../lib/util";
  import {EDIT, VIEW} from "../lib/consts";
  import {unsaved_changes_default_dialog} from "../lib/dialogs";

  export default {
    data() {
      return {
        openSaveDialog: false,
        unsaved_changes_dialog: unsaved_changes_default_dialog,
      }
    },
    props: {
      entry_navigation_props: {
        type: Object,
        default: () => {}
      }
    },
    name: "FullEntryMixin",
    computed: {
      mode: {
        get() {
          return this.$route.query.entry_mode || VIEW
        },
        set(mode) {
          this.to_entry(this.uuid, mode)
        }
      },
      is_view_mode() {
        return this.mode === VIEW
      },
      is_edit_mode() {
        return this.mode === EDIT
      },
      meta_aspects_privacy() {
        let result = []
        result.push({icon: privacy_icon(this.entry.privacy), name: this.entry.privacy})
        result.push({name: "License: " + this.entry.license})
        return result
      },
      show_image() {
        return this.entry.image
      },
      entry_actions_props() {
        return {
          entry: this.entry,
          template_slug: this.entry.template.slug,
          mode: this.mode,
          passed_uuid: this.uuid,
          entry_complete: this.entry_complete,
          is_dirty: this.is_dirty
        }
      },
    }
    // methods: {
    //   entry_image() {
    //     return static_file_path(this.$store, '/images/entry_images/' + this.entry.image)
    //   }
    // }
  }
