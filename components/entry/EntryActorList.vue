<template lang="pug">
  div
    v-chip(v-for="actor_role in actors" pill)
      v-avatar(left)
        v-img(:src="avatar(actor_role.actor)")
      span {{actor_role.actor.public_name}}
</template>

<script>
  export default {
    name: "EntryActorList",
    props: {
      actors: {
        type: Array
      }
    },
    methods: {
      avatar(actor) {
        return this.$axios.defaults.baseURL + "/actor/" + actor.registered_name + "/avatar"
      }
    }
  }
</script>

<style scoped>

</style>
