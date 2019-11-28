import {has_parent} from "../lib/entry";
import {
  ENTRIES_GET_ENTRY_TITLE,
  ENTRIES_GET_PARENT,
  ENTRIES_GET_RECURSIVE_ENTRIES, ENTRYTYPES_TYPE,
  ENTRYTYPES_TYPENAME
} from "../lib/store_consts";
import {app_version} from "../lib/client";
import {export_data} from "../lib/import_export";

export default {
  name: "EntryMixin",
  mixins: [],
  data() {
    return {
      page: this.$route.query.page | 0,
    }
  },
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
      return this.$store.getters[ENTRYTYPES_TYPE](this.entry.type_slug)
    },
    type_name() {
      return this.entry_type.title
    },
    has_pages() {
      return this.entry_type.content.meta.hasOwnProperty("pages")
    },
    named_pages() {
      return this.entry_type.content.meta.hasOwnProperty("named_pages") || false
    },
    pages() {
      return this.entry_type.content.meta.pages || []
    },
    last_page() {
      return !this.has_pages || this.page === this.pages.length - 1
    },
    page_title() {
      return this.entry_type.title + (this.title ? ": " + this.title : "")
    },
    shown_aspects() {
      if (this.has_pages) {
        return this.$_.filter(this.entry_type.content.aspects, (a) => {
          return (this.page === 0 && (a.attr.page === 0 || a.attr.page === undefined) ||
            (this.page > 0 && a.attr.page === this.page))
        })
      }
      return this.entry_type.content.aspects
    },
    outdated() {
      return (this.entry.app_version || "") !== app_version()
    },
    download_title() {
      // todo title, wont update in real time
      const entry_title = this.$store.getters[ENTRIES_GET_ENTRY_TITLE](this.entry.uuid)
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
