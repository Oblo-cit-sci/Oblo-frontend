import {has_parent} from "../lib/entry";
import {ENTRIES_GET_PARENT, ENTRIES_GET_RECURSIVE_ENTRIES} from "../lib/store_consts";
import {app_version} from "../lib/client";
import {export_data} from "../lib/import_export";

export default {
  name: "EntryMixin",
  computed: {
    has_parent() {
      return has_parent(this.entry)
    },
    parents() {
      let act = this.entry
      let result = []
      while (act.refs.parent) {
        act = this.$store.getters[ENTRIES_GET_PARENT](act.uuid)
        //console.log("act", act)
        result.push({
            text: act.title,
            href: 'breadcrumbs_dashboard',
          })
      }
      return result
    },
    entry_type() {
      return this.$store.getters.entry_type(this.entry.type_slug)
    },
    type_name() {
      return this.entry_type.title
    },
    has_pages() {
      return this.entry_type.content.meta.hasOwnProperty("pages")
    },
    pages() {
      return this.entry_type.content.meta.pages || []
    },
    outdated() {
      return (this.entry.app_version || "") !== app_version()
    },
    download_title() {
      // todo title, wont update in real time
      const entry_title = this.$store.getters["entries/get_entry_title"](this.entry.uuid)
      return (this.type_name + "_" + entry_title).replace(" ", "_") + ".json"
    }
  },
  methods: {
    download() {
      let entries = this.$store.getters[ENTRIES_GET_RECURSIVE_ENTRIES](this.entry.uuid)
      entries = this.$_.map(entries, e => {
        const clone = this.$_.cloneDeep(e)
        delete clone.local
        return clone
      })
      export_data(entries, this.download_title)
      this.$store.commit("entries/set_downloaded", this.entry.uuid)
    }
  }
}
