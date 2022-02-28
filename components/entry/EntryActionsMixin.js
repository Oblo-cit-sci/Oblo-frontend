import {can_edit_entry} from "~/lib/actors"
import {EDIT, REQUIRES_REVIEW, REVIEW, VIEW} from "~/lib/consts"

export default {
  name: "EntryActionsMixin",
  computed: {
    proper_mode() {
      // todo in the future if entries need review (not just public) it should differentiate creator and reviewer
      if (this.can_edit) {
        if (this.entry.status === REQUIRES_REVIEW) {
          return REVIEW
        } else {
          return EDIT
        }
      } else {
        return VIEW
      }
    },
    proper_mode_text() {
      if (this.outdated)
        return this.$t("comp.entrypreview.update")
      else
        return this.$t("comp.entrypreview." + this.proper_mode)
    },
    proper_mode_color() {
      if (this.outdated) {
        return "blue lighten-2"
      } else if(this.proper_mode === REVIEW) {
        return "orange lighten-2"
      }
    },
    can_edit() {
      return can_edit_entry(this.$store.getters.user, this.entry)
    }
  }
}
