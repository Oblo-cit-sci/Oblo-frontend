import {get_local_entry} from "../lib/entry";


export default {
  created() {
    const draft_id = this.$route.params.draft_id // draft_id or entry_uuid
    if (draft_id) {
      this.entry = JSON.parse(JSON.stringify(this.$store.state.edrafts.drafts[draft_id]))
    } else {
      const local_id = this.$route.params.local_id
      this.entry = JSON.parse(JSON.stringify(this.$store.state.entries.own_entries.get(local_id)))
    }

    //console.log(this.type_slug)
    this.entry_type = this.$store.getters.entry_type(this.entry.type_slug)
    //console.log(this.entry_type)
    this.has_pages = this.entry_type.content.meta.hasOwnProperty("pages")

    let required_aspects = this.$_.filter(this.entry_type.content.aspects, (a) => a.required || false)
    this.required_values = this.$_.map(required_aspects, (a) => {
      return a.name
    })

    if (this.entry.ref) {
      // TODO maybe simply copy?!
      let ref = this.entry.ref
      let parent = {}
      if (ref.hasOwnProperty("draft_id")) {
        parent = this.$store.state.edrafts.drafts[ref.draft_id];
        ref.type = "draft"
      } else if (this.entry.ref.hasOwnProperty("entry_id")) {
        ref.type = "entry"
        // todo...
      }

      ref.type_slug = parent.type_slug
      ref.parent_title = parent.title

      /* set aspect refs:
          when an attribute has #
          this doesnt belong here, especially cuz of the duplicate for edit/_local_id page
      * */
      for (let aspect of this.entry_type.content.aspects) {
        if (aspect.attr.value) {
          const val = aspect.attr.value
          if (val.startsWith("#")) { // a reference attribute
            let access = val.split(".")
            let select = this.entry
            let select_type = "entry"
            let history = [select]
            if (access[0].length > 1) { // first access is # and eventual one or more "/"
              // for now we assume its all just "/" chars
              for (let up of Array(access[0].length - 1).keys()) {
                select = get_local_entry(this.$store, select.ref)
                history.push(select)
              }
            }
            access.splice(0, 1)
            for (let c of access) {
              if (select_type === "entry") {
                select = select.aspects_values[c]
                history.push(select)
                select_type = "aspect"
              }
              // todo
              if (select_type === "aspect") {
                // here composite and list access
              }
            }
            if (select_type === "aspect") {
              this.entry.aspects_values[aspect.name] = JSON.parse(JSON.stringify(select))
            }
          }
        }
      }
    }

  },
  data() {
    return {
      // from the store should include
      // type_slug, draft_id, entry_id, license, privacy, version, status, aspects_values, ref
      entry: null,
      entry_type: null, // the full shizzle for the type_slug

      required_values: [], // shortcut, but in entry_type
      sending: false,
      complete: true,
      has_pages: false,
      page: 0,
      last_page: false
    }
  },
  methods: {}
}
