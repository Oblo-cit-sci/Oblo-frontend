import {has_parent} from "../lib/entry";
import {ENTRIES_GET_PARENT} from "../lib/store_consts";

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
    has_pages() {
      return this.entry_type.content.meta.hasOwnProperty("pages")
    },
    pages() {
      return this.entry_type.content.meta.pages || []
    }
  }
}
