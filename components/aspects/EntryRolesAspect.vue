<template lang="pug">
  div
    div.mt-2(v-for="role in available_roles" :key="role.name")
      Title_Description(:aspect="role" mode="edit" header_type="h4")
      ActorSearch(
        :multiple="role.name !== 'creator'"
        v-model="grouped_roles[role.name]"
        :min="role.name === 'creator' ? 1 : 0"
        @input="role_set(role, $event)"
        @update:error="$emit('update:error', $event)"
        :exclude_reg_names="all_actors_reg_names")
</template>

<script>
import AspectComponentMixin from "./AspectComponentMixin";
import ActorSearch from "../actor/ActorSearch";
import {COLLABORATOR, CREATOR, ROLE_ICONS, SHARED} from "~/lib/actors"
import Title_Description from "~/components/util/Title_Description"
import {REQUIRES_REVIEW, VISITOR} from "~/lib/consts"
import {get_creator} from "~/lib/entry"

/**
 * In the entry and in the DB they are stored as array per each item is
 * (E) role: <role>, actor: <ActorBase>,
 * however here we need them grouped by the role, so
 *
 * (A) {<role>: list[ActorBase]} for each role
 *
 * method: grouped_roles does the transformation from E -> A
 *
 * when something changes, role_set emits up a version that is transformed back (A -> E)
 */

export default {
  name: "EntryRolesAspect",
  mixins: [AspectComponentMixin],
  components: {Title_Description, ActorSearch},
  props: {
    entry_is_private: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      search_error: {}
    }
  },
  computed: {
    all_actors_reg_names() {
      // console.log("all_actors_reg_names", this.value)
      return this.value.map(ra => ra.actor.registered_name)
    },
    available_roles() {
      const base_path = "asp.entry_roles.roles."
      const roles = [
        {
          name: COLLABORATOR,
          label: this.$t(base_path + "collaborator.label"),
          description: this.$t(base_path + "collaborator.descr"),
          icon: ROLE_ICONS[COLLABORATOR]
        }
      ]
      const entry = this.get_entry()
      if (this.is_admin && entry.status === REQUIRES_REVIEW && get_creator(entry).registered_name === VISITOR) {
        roles.unshift(
          {
            name: CREATOR,
            label: this.$t(base_path + "creator.label"),
            description: this.$t(base_path + "creator.descr"),
            icon: ROLE_ICONS[CREATOR]
          }
        )
      }
      if (this.entry_is_private) {
        roles.push({
          name: SHARED,
          label: this.$t(base_path + "shared.label"),
          description: this.$t(base_path + "shared.descr"),
          icon: ROLE_ICONS[SHARED]
        })
      }
      return roles
    },
    grouped_roles: {
      get() {
        const groups = this.$_.groupBy(this.value, "role")
        for (let [role, role_actors] of Object.entries(groups)) {
          groups[role] = role_actors.map(ra => ra.actor)
        }
        return groups
      }
    },
  },
  methods: {
    role_set(role, actors) {
      let ungruouped_actors = []
      for (let [role, role_actors] of Object.entries(this.grouped_roles)) {
        if (Array.isArray(role_actors)) {
          ungruouped_actors = this.$_.concat(ungruouped_actors, role_actors.map(a => {
              return {
                role, actor: a
              }
            })
          )
        } else {
          if (role_actors) {
            ungruouped_actors = this.$_.concat(ungruouped_actors, {role, actor: role_actors})
          }
        }
      }
      this.update_mvalue(ungruouped_actors)
    }
  }
}
</script>

<style scoped>

</style>
