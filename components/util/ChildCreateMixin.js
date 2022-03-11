import {aspect_loc_uuid, pack_value} from "~/lib/aspect";
import {EDIT, ENTRY_INDEX} from "~/lib/consts";
import EntryCreateMixin from "~/components/entry/EntryCreateMixin";

export default {
  name: "ChildCreateMixin",
  // todo: not sure why but including this kills the app
  // mixins: [EntryCreateMixin],
  methods: {
    create_child(aspect_loc, language, child_type_slug) {
      const entry_uuid = aspect_loc_uuid(aspect_loc)
      const value = this.$store.getters["entries/value"](aspect_loc).value
      const index_aspect_loc = this.aspect_loc_for_index(aspect_loc, value.length)
      const child = this.create_entry(child_type_slug, language, {}, {
        uuid: entry_uuid,
        aspect_loc: index_aspect_loc,
      })
      // saving the child, setting refrences, saving this entry(title),
      this.$store.dispatch("entries/save_child_n_ref", {
        uuid: entry_uuid,
        child: child,
        aspect_loc: index_aspect_loc})

      // TODO. needed depracated set_entry_value removed
      // const new_value = this.$_.concat(value, [child.uuid])
      // this.$store.commit("entries/set_entry_value", {aspect_loc: aspect_loc, value: pack_value(new_value)})
      // this.persist_entries().then()
      // this.persist_edit_entry().then()
      // goto
      this.to_entry(child.uuid, EDIT)
    },
    aspect_loc_for_index(aspect_loc, index) {
      return this.$_.concat(this.$_.drop(aspect_loc), [[ENTRY_INDEX, index]])
    },
  }
}
