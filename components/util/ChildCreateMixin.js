import {aspect_loc_uuid, pack_value} from "~/lib/aspect";
import {create_entry} from "~/lib/entry";
import {EDIT, ENTRY_INDEX} from "~/lib/consts";

export default {
  name: "ChildCreateMixin",
  methods: {
    create_child(aspect_loc, child_type_slug) {
      const entry_uuid = aspect_loc_uuid(aspect_loc)
      const value = this.$store.getters["entries/value"](aspect_loc).value
      const index_aspect_loc = this.aspect_loc_for_index(aspect_loc, value.length)
      const child = create_entry(this.$store, child_type_slug, {}, {
        uuid: entry_uuid,
        aspect_loc: index_aspect_loc,
      })
      // saving the child, setting refrences, saving this entry(title),
      this.$store.dispatch("entries/save_child_n_ref", {
        uuid: entry_uuid,
        child: child,
        aspect_loc: index_aspect_loc})

      const new_value = this.$_.concat(value, [child.uuid])
      this.$store.dispatch("entries/set_entry_value", {aspect_loc: aspect_loc, value: pack_value(new_value)})

      this.persist_entries()
      // goto
      this.to_entry(child.uuid, EDIT)
    },
    aspect_loc_for_index(aspect_loc, index) {
      return this.$_.concat(this.$_.drop(aspect_loc), [[ENTRY_INDEX, index]])
    },
  }
}
