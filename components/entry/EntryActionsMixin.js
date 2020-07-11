import {can_edit, editing_roles} from "~/lib/actors"
import {ADMIN, EDIT, REQUIRES_REVIEW, REVIEW, VIEW} from "~/lib/consts"
import {USER_GLOBAL_ROLE} from "~/store/user"

export default {
  name: "EntryActionsMixin",
  computed: {
    proper_mode() {
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
      const actor = this.$store.getters.user
      if (actor.global_role === ADMIN) {
        return true
      }
      const actors = this.entry.actors
      for (let actor_roles of actors) {
        if (actor_roles.actor.registered_name === actor.registered_name)
          return editing_roles.includes(actor_roles.role)
      }
    }
  }
}
