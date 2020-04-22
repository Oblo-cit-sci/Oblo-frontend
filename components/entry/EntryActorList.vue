<template lang="pug">
  div
    ActorChip(v-for="actor_role in actors" :actor="actor_role.actor" :role="actor_role.role" :key="actor_role.actor.registered_name")
</template>

<script>
  import ActorChip from "../actor/ActorChip"

  export default {
    name: "EntryActorList",
    components: {ActorChip},
    props: {
      actors: {
        type: Array
      }
    }
  }
</script>

<style scoped>

</style>
