import {can_edit} from "~/lib/actors"
import {EDIT, REVIEW, VIEW} from "~/lib/consts"

export default {
  name: "EntryActionsMixin",
  computed: {
    proper_mode() {
      if (can_edit(this.entry, this.$store.getters.user)) {
        if (this.entry.status === "requires_review") {
          return REVIEW
        } else {
          return EDIT
        }
      } else {
        return VIEW
      }
    }
  }
}
