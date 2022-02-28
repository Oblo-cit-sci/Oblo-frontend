import {EDIT, GLOBAL, NO_DOMAIN, QP_D, VIEW} from "~/lib/consts";
import {aspect_loc_str} from "~/lib/aspect";
import TriggerSnackbarMixin from "./TriggerSnackbarMixin";
import NavBaseMixin from "./NavBaseMixin";

import EntryActionsMixin from "~/components/entry/EntryActionsMixin"
import URLQueryMixin from "~/components/util/URLQueryMixin"
import {mapGetters} from "vuex"

import {JSONPath} from 'jsonpath-plus';
import {BUS_MAP_GOTO_GEOMETRY_FEATURE_VALUE} from "~/plugins/bus"

export default {
  mixins: [TriggerSnackbarMixin, NavBaseMixin, EntryActionsMixin, URLQueryMixin],
  methods: {
    // why does has_entry call get entry
    goto(uuid, force_mode) {
      // console.log("gotoooo")
      // todo should push not init?!
      this.$store.commit("init_page_path", this.$route)
      const has_full_entry = this.$store.getters["entries/has_full_entry"](uuid)
      // console.log("has full", has_full_entry)
      const mode = force_mode ? force_mode : this.proper_mode
      // console.log("full?", has_full_entry)
      // if (!has_full_entry) { // todo replace values by entry.local.is_full: Boolean
      //   // console.log("grabbing")
      //   // console.log("fetching...")
      //   // todo, wanted to use this.fetch but doesnt work...
      //   this.$api.entry.get(this.entry.uuid).then(({data}) => {
      //     if (data.data) {
      //       const entry = data.data
      //       this.$store.commit("entries/save_entry", entry)
      //       // console.log("prevent change", this.prevent_view_page_change)
      //       if (this.prevent_view_page_change && mode === VIEW) {
      //         this.show_in_route(uuid, mode)
      //       } else {
      //         this.to_entry(uuid, mode)
      //       }
      //     }
      //   }).catch(err => {
      //     console.log("error fetching entry")
      //   })
      // } else {
      // console.log("straight")
      // console.log(!this.prevent_view_page_change, mode === EDIT)
      if (!this.prevent_view_page_change || mode === EDIT) {
        // console.log("straight & nav")
        this.to_entry(uuid, mode)
      } else {
        // console.log("straight & show")
        this.show_in_route(uuid, mode)
        // this.$emit("preview_action", {uuid: this.entry.uuid, action: mode})
      }
      // }
    },
    async fetch(uuid) {
      const data = await this.$api.entry.get(uuid)
      if (data.status === 200) {
        // beautiful
        const entry = data.data.data
        entry.local = {}
        this.$store.commit("entries/save_entry", entry)
        return Promise.resolve(entry)
      } else {
        console.log("err")
        return Promise.reject(data)
      }
    },
    fetch_and_nav(uuid) {
      this.$api.entry.get(uuid).then(({data}) => {
        if (data.data) {
          // console.log("downloading entry", res)
          const entry = Object.assign(data.data, {local: {}})
          this.$store.commit("entries/save_entry", entry)
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
      // this.map_goto(uuid)
    },
    // TODO. this could be just for some entry-mixin. since we are always moving to some currently given entry
    map_goto(entry_uuid) {
      // console.log("map goto", entry_uuid)
      const entry = this.$store.getters["entries/get_entry"](entry_uuid)
      const entry_loc = entry.location
      if (entry_loc && entry_loc.length > 0) {
        this.$store.commit("map/goto_location", entry_loc[0])
        return
      }
      // console.log("MAP-GOTO!!")
      if (this.template) {
        const geometry_aspect = this.template.rules.geometry_aspect
        if (geometry_aspect) {
          const geometry_value = JSONPath({path: geometry_aspect, json: entry.values})
          // console.log(geometry_value)
          // todo check what the result is if not found. or defined or empty
          if (geometry_value && geometry_value.length > 0 && geometry_value[0].value) {
            // console.log("$bus-emit")
            this.$bus.$emit(BUS_MAP_GOTO_GEOMETRY_FEATURE_VALUE, geometry_value[0].value)
          }
        }
      }
    },
    to_parent(to_last_element = true, mode = VIEW) {
      if (this.entry.entry_refs.parent) {
        let parent_entry_type_slug = this.$store.getters["entries/get_entry"](parent_ref.uuid).templates.slug

        const uuid = parent_ref.uuid

        // TODO this loc stuff will work different in the future
        const aspect_def = this.$store.getters["templates/get_aspect_def"]({
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
        this.$store.commit("pop_last_page_path")
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
    ...mapGetters({has_entry: "entries/has_entry", has_full_entry: "entries/has_full_entry"})
  }
}
