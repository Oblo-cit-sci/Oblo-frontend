<template lang="pug">
  div
    ActorChip.mb-2(v-for="actor_role in ordered_actors" :actor="actor_role.actor" :role="actor_role.role" :key="actor_role.actor.registered_name")
</template>

<script>
  import ActorChip from "../actor/ActorChip"
  import {ordered_entry_roles} from "~/lib/actors"

  export default {
    name: "EntryActorList",
    components: {ActorChip},
    props: {
      actors: {
        type: Array
      }
    },
    computed: {
      ordered_actors() {
        return this.$_.sortBy(this.actors, a => {
          return ordered_entry_roles.indexOf(a.role)
        });
      }
    }
  }
</script>

<style scoped>

</style>
