import {can_edit, editing_roles} from "~/lib/actors"
import {ADMIN, EDIT, REVIEW, VIEW} from "~/lib/consts"
import {USER_GLOBAL_ROLE} from "~/store/user"

export default {
  name: "EntryActionsMixin",
  computed: {
    proper_mode() {
      if (this.can_edit) {
        if (this.entry.status === "requires_review") {
          return REVIEW
        } else {
          return EDIT
        }
      } else {
        return VIEW
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
