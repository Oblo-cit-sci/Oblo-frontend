import EntryMixin from "~/components/entry/EntryMixin"
import {draft_color} from "~/lib/consts"
import AspectSetMixin from "~/components/aspects/AspectSetMixin"
import {allow_download} from "~/lib/template"

export default {
  name: "EntryFullMixin",
  mixins: [AspectSetMixin, EntryMixin],
  data() {
    return {
      entry_complete: false
    }
  },
  computed: {
    allow_download() {
      return allow_download(this.template)
    },
    entry_actions_props() {
      // console.log("update actions props")
      return {
        entry: this.entry,
        mode: this.mode,
        entry_complete: this.entry_complete,
        // todo not great cuz the mixin for that is AspectSetMixin is in Entry
        has_errors: this.has_errors,
        is_dirty: this.is_dirty,
        allow_download: this.allow_download,
        conditionals: this.regular_values
      }
    },
    entry_title_description_props() {
      return {
        title: this.full_title(false),
        header_type: "h3",
        description: this.is_editable_mode ? this.get_description : "",
        descr_as_html: true
      }
    },
    draft_color() {
      return draft_color
    },
    get_description() {
      const long_description = this.template.values?.long_description
      if (long_description)
        return long_description
      return this.template.description
    }
  },
  created() {
    if (this.is_draft && this.is_edit_mode) {
      this.check_creator_switch()
    }
    this.map_goto(this.uuid)
  },
  methods: {
    aspect_mvalue(aspect_name) {
      return this.entry.values[aspect_name]
    },
    entryAction(action) {
      if (action === "delete") {
        this.delete_entry = true
      }
    },
    page_title_description_props(page) {
      // console.log(page)
      return {
        title: page.title,
        header_type: "h2",
        description: this.is_editable_mode ? page.description : ""
      }
    },
  }
}
