import {has_parent} from "../lib/entry";
import {
  ENTRIES_GET_ENTRY,
  ENTRIES_GET_ENTRY_TITLE,
  ENTRIES_GET_PARENT,
  ENTRIES_GET_RECURSIVE_ENTRIES, ENTRYTYPES_TYPE,
} from "../lib/store_consts";
import {export_data} from "../lib/import_export";
import {ENTRIES_SET_DOWNLOADED} from "~/lib/store_consts";
import {loc_append} from "~/lib/aspect";
import {ASPECT, ENTRY} from "~/lib/consts";

export default {
  name: "EntryMixin",
  mixins: [],
  props: {
    passed_uuid: {
      type: String
    }
  },
  data() {
    return {
      aspect_locs: {},
      page: this.$route.query.page | 0,
    }
  },
  computed: {
    uuid() {
      if (this.passed_uuid) {
        return this.passed_uuid
      } else {
        return this.$route.params.uuid
      }
    },
    entry() {
      return this.$store.getters[ENTRIES_GET_ENTRY](this.uuid)
    },
    has_parent() {
      return has_parent(this.entry)
    },
    parents() {
      let act = this.entry
      let result = []
      while (act.refs.parent) {
        act = this.$store.getters[ENTRIES_GET_PARENT](act.uuid)
        result.push({
          text: act.title,
          href: 'breadcrumbs_dashboard',
        })
      }
      return result
    },
    type_slug() {
      return this.entry.type_slug
    },
    entry_type() {
      return this.$store.getters[ENTRYTYPES_TYPE](this.type_slug)
    },
    title() {
      return this.$store.getters[ENTRIES_GET_ENTRY_TITLE](this.uuid)
    },
    parent_title() {
      // console.log("getting parent title", this)
      // todo not necessarily available for remote entries. should be included?
      //console.log(this.$store.getters[ENTRIES_GET_PARENT]())
      return this.$store.getters[ENTRIES_GET_PARENT](this.uuid).title
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
    aspect_loc() {
      return [ENTRY, this.uuid, this.type_slug]
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
      return (this.entry.parent_type_version || 0) !== this.entry_type.version
    },
    download_title() {
      // todo title, wont update in real time
      const entry_title = this.$store.getters[ENTRIES_GET_ENTRY_TITLE](this.entry.uuid)
      return (this.type_name + "_" + entry_title).replace(" ", "_") + ".json"
    }
  },
  beforeMount() {
    console.log("beforeMount")
    this.update_aspect_locs()
  },
  beforeUpdate() {
    // console.log("update")
    this.update_aspect_locs()
  },
  methods: {
    download() {
      let entries = this.$store.getters[ENTRIES_GET_RECURSIVE_ENTRIES](this.entry.uuid)
      entries = this.$_.map(entries, e => {
        const clone = this.$_.cloneDeep(e)
        delete clone.local
        return clone
      })
      export_data({entries: entries}, this.download_title)
      this.$store.commit(ENTRIES_SET_DOWNLOADED, this.entry.uuid)
    },
    update_aspect_locs() {
      // console.log("update_aspect_locs")
      for (let aspect of this.entry_type.content.aspects) {
        this.aspect_locs[aspect.name] = loc_append([this.aspect_loc], ASPECT, aspect.name)
        // console.log(aspect.name, this.aspect_locs[aspect.name])
      }
    }
  }
}
