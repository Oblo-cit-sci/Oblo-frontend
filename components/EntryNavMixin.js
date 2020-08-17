import {EDIT, GLOBAL, NO_DOMAIN, QP_D, VIEW} from "~/lib/consts";
import {aspect_loc_str} from "~/lib/aspect";
import TriggerSnackbarMixin from "./TriggerSnackbarMixin";
import NavBaseMixin from "./NavBaseMixin";
import {
  ENTRIES_GET_ENTRY,
  ENTRIES_HAS_FULL_ENTRY,
  ENTRIES_SAVE_ENTRY
} from "~/store/entries";
import {INIT_PAGE_PATH, POP_LAST_PAGE_PATH} from "~/store";
import {TEMPLATES_GET_ASPECT_DEF} from "~/store/templates";
import EntryActionsMixin from "~/components/entry/EntryActionsMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import {mapGetters} from "vuex"

export default {
  mixins: [TriggerSnackbarMixin, NavBaseMixin, EntryActionsMixin, EntryActionsMixin, URLQueryMixin],

  methods: {
    // why does has_entry call get entry
    goto(uuid, force_mode) {
      // console.log("gotoooo")
      // todo should push not init?!
      this.$store.commit(INIT_PAGE_PATH, this.$route)
      const has_full_entry = this.$store.getters[ENTRIES_HAS_FULL_ENTRY](uuid)
      // console.log("has full", has_full_entry)
      const mode = force_mode ? force_mode : this.proper_mode
      // console.log("full?", has_full_entry)
      if (!has_full_entry) { // todo replace values by entry.local.is_full: Boolean
        // console.log("grabbing")
        // console.log("fetching...")
        // todo, wanted to use this.fetch but doesnt work...
        this.$api.entry__$uuid(this.entry.uuid).then(({data}) => {
          if (data.data) {
            const entry = data.data
            this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
            console.log("prevent change", this.prevent_view_page_change)
            if (this.prevent_view_page_change && mode === VIEW) {
              this.show_in_route(uuid, mode)
            } else {
              this.to_entry(uuid, mode)
            }
          }
        }).catch(err => {
          console.log("error fetching entry")
        })
      } else {
        // console.log("straight")
        if (!this.prevent_view_page_change || mode === EDIT) {
          // console.log("straight & nav")
          this.to_entry(uuid, mode)
        } else {
          // console.log("straight & show")
          this.show_in_route(uuid, mode)
          // this.$emit("preview_action", {uuid: this.entry.uuid, action: mode})
        }
      }
    },
    async fetch(uuid) {
      const data = await this.$api.entry__$uuid(uuid)
      if(data.status === 200) {
        // beautiful
        const entry = data.data.data
        entry.local = {}
        this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
        return Promise.resolve(entry)
      } else {
        console.log("err")
        return Promise.reject(data)
      }
    },
    fetch_and_nav(uuid) {
      this.$api.entry__$uuid(uuid).then(({data}) => {
        if (data.data) {
          // console.log("downloading entry", res)
          const entry = Object.assign(data.data, {local: {}})
          this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
          this.to_entry(uuid, this.proper_mode)
        }
      }).catch(() => {
        // todo ENH: could also be an error msg from the server
        this.error_snackbar("Couldn't fetch entry")
      })
    },
    show_in_route(uuid, entry_mode) {
      // todo something here takes a long time... or maybe showing the preview
      const query = {uuid, entry_mode, ...this.query_param_domain}
      // this.$router.push(route_change_query(this.$route, query, true))
      this.$router.push({name: this.$route.name, query: query})
      this.map_goto(uuid)
    },
    map_goto(entry_uuid) {
      const entry_loc = this.$store.getters[ENTRIES_GET_ENTRY](entry_uuid).location
      if (entry_loc && entry_loc.length > 0) {
        this.$store.commit("map/goto_location", entry_loc[0])
      }
    },
    to_parent(to_last_element = true, mode = VIEW) {
      if (this.in_context) {
        const parent_ref = this.entry.entry_refs.parent
        let parent_entry_type_slug = this.$store.getters[ENTRIES_GET_ENTRY](parent_ref.uuid).template.slug

        const uuid = parent_ref.uuid

        // TODO this loc stuff will work different in the future
        const aspect_def = this.$store.getters[TEMPLATES_GET_ASPECT_DEF]({
          type_slug: parent_entry_type_slug,
          aspect_name: parent_ref.aspect_loc[0][1]
        })
        let query = {
          page: aspect_def.attr.page,
        }
        if (to_last_element) {
          const aspect_id = aspect_loc_str(parent_ref.aspect_loc)
          query.goTo = (aspect_id ? aspect_id : "")
        }
        this.$store.commit(POP_LAST_PAGE_PATH)
        this.to_entry(uuid, mode, query)
      } else {
        if (this.domain.value === NO_DOMAIN) {
          this.home()
        } else {
          // todo could be a bit nicer (named router, route param...)
          this.$router.push("/domain/" + this.domain.value)
        }
      }
    }
  },
  computed: {
    ...mapGetters({has_entry:"entries/has_entry", has_full_entry:"entries/has_full_entry"}),
    in_context() {
      // todo rules check should go...
      return this.template.rules.context !== GLOBAL || this.entry.entry_refs.parent
    }
  }
}
