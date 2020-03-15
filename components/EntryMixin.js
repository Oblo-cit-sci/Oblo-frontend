import {has_parent} from "../lib/entry";
import {
  ENTRYTYPES_TYPE,
} from "../lib/store_consts";
import {export_data} from "../lib/import_export";
import {loc_append} from "~/lib/aspect";
import {ASPECT, ENTRY, GLOBAL} from "~/lib/consts";
import {SEARCH_GET_ENTRIES, SEARCH_GET_ENTRY} from "~/store/search";
import {check_str_is_uuid} from "~/lib/fixes";
import {
  ENTRIES_GET_ENTRY,
  ENTRIES_GET_ENTRY_TITLE,
  ENTRIES_GET_PARENT,
  ENTRIES_GET_RECURSIVE_ENTRIES, ENTRIES_HAS_ENTRY, ENTRIES_SET_DOWNLOADED
} from "~/store/entries";
import {FILES_GET_FILE} from "~/store/files";

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
    in_context() {
      return this.template.rules.context !== GLOBAL || this.entry.refs.parent
    },
    entry_stored() {
      return this.$store.getters[ENTRIES_HAS_ENTRY](this.uuid)
    },
    entry() {
      let entry = this.$store.getters[ENTRIES_GET_ENTRY](this.uuid)
      if (!entry) {
        console.log("WARNING, ENTRY MISSING IN CACHE")
        return null
      }
      return entry
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
    actors() {
      return this.entry.actors
    },
    template_slug() {
      return this.entry.template.slug
    },
    template() {
      return this.$store.getters[ENTRYTYPES_TYPE](this.template_slug)
    },
    title() {
      return this.$store.getters[ENTRIES_GET_ENTRY_TITLE](this.uuid)
    },
    entry_image() {
      if (this.entry.image) {
        if (this.entry.image.startsWith("http")) {
          return this.entry.image
        } else if (check_str_is_uuid(this.entry.image)) {
          if(this.entry.status === "draft") {
            const img_data = this.$store.getters[FILES_GET_FILE](this.entry.image)
            if (img_data) {
              return img_data.data
            }
          } else {
            return this.$api.url_entry__$uuid__attachment__$file_uuid(this.uuid, this.entry.image)
          }
        } else {
          return null
        }
      }
    },
    parent_title() {
      // console.log("getting parent title", this)
      // todo not necessarily available for remote entries. should be included?
      //console.log(this.$store.getters[ENTRIES_GET_PARENT]())
      return this.$store.getters[ENTRIES_GET_PARENT](this.uuid).title
    },
    type_name() {
      return this.template.title
    },
    has_pages() {
      return this.template.rules.hasOwnProperty("pages")
    },
    named_pages() {
      return this.template.rules.hasOwnProperty("named_pages") || false
    },
    pages() {
      return this.template.rules.pages || []
    },
    last_page() {
      return !this.has_pages || this.page === this.pages.length - 1
    },
    page_title() {
      return this.template.title + (this.title ? ": " + this.title : "")
    },
    aspect_loc() {
      return [ENTRY, this.uuid, this.template.slug]
    },
    shown_aspects() {
      if (this.has_pages) {
        return this.$_.filter(this.template.aspects, (a) => {
          return (this.page === 0 && (a.attr.page === 0 || a.attr.page === undefined) ||
            (this.page > 0 && a.attr.page === this.page))
        })
      }
      return this.template.aspects
    },
    outdated() {
      return (this.entry.parent_type_version || 0) !== this.template.version
    },
    download_title() {
      // todo title, wont update in real time
      const entry_title = this.$store.getters[ENTRIES_GET_ENTRY_TITLE](this.entry.uuid)
      return (this.type_name + "_" + entry_title).replace(" ", "_") + ".json"
    }
  },
  beforeMount() {
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
      if (this.entry_stored)
        for (let aspect of this.template.aspects) {
          this.aspect_locs[aspect.name] = loc_append([this.aspect_loc], ASPECT, aspect.name)
          // console.log(aspect.name, this.aspect_locs[aspect.name])
        }
    },
    get_attachments_to_post() {
      const new_files_data = []
      for (let file of this.entry.attached_files) {
        if (!file.hasOwnProperty("url")) {
          new_files_data.push(file)
        }
      }
      return new_files_data
    }
  }
}
