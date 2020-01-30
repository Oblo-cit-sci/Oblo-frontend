
  import {privacy_icon, static_file_path} from "../lib/util";
  import {loc_append} from "../lib/aspect";
  import {ASPECT, EDIT, ENTRY, VIEW} from "../lib/consts";
  import {unsaved_changes_default_dialog} from "../lib/dialogs";

  export default {
    data() {
      return {
        openSaveDialog: false,
        unsaved_changes_dialog: unsaved_changes_default_dialog,
      }
    },
    props: {
      // mode: 3
      entry_navigation_props: {
        type: Object,
        default: () => {}
      }
    },
    name: "FullEntryMixin",
    computed: {
      mode: {
        get() {
          return this.$route.query.mode || VIEW
        },
        set(mode) {
          this.to_entry(this.uuid, mode)
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
      },
      entry_actions_props() {
        return {
          mode: this.mode,
          passed_uuid: this.uuid,
        }
      },
    },
    methods: {
      entry_image() {
        return static_file_path(this.$store, '/images/entry_images/' + this.entry.image)
      }
    }
  }
