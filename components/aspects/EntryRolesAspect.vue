<template lang="pug">
  div
    div.mt-2(v-for="role in available_roles" :key="role.name")
      Title_Description(:aspect="role" mode="edit" header_type="h4")
      ActorSearch(
        multiple
        v-model="grouped_roles[role.name]"
        @input="role_set(role, $event)"
        :exclude_reg_names="all_actors_reg_names")
</template>

<script>
  import AspectComponentMixin from "./AspectComponentMixin";
  import ActorSearch from "../actor/ActorSearch";
  import {COLLABORATOR, SHARED} from "~/lib/actors"
  import Title_Description from "~/components/util/Title_Description"

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
        assigned_roles: {}
      }
    },
    computed: {
      all_actors_reg_names() {
        return this.value.map(ra => ra.actor.registered_name)
      },
      available_roles() {
        const base_path = "asp.entry_roles.roles."
        const roles = [
          {
            name: COLLABORATOR,
            label: this.$t(base_path + "collaborator.label"),
            description: this.$t(base_path + "collaborator.descr"),
            icon: "mdi-pencil"
          }
        ]
        if (this.entry_is_private) {
          roles.push({
            name: SHARED,
            label: this.$t(base_path + "shared.label"),
            description: this.$t(base_path + "shared.descr"),
            icon: "mdi-eye-outline"
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
          ungruouped_actors = this.$_.concat(ungruouped_actors, role_actors.map(a => {
              return {
                role, actor: a
              }
            })
          )
        }
        this.update_value(ungruouped_actors)
      }
    }
  }
</script>

<style scoped>

</style>
