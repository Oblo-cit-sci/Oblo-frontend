<template lang="pug">
  div
    v-chip.ml-1(v-for="actor_role in actors" pill :key="actor_role.actor.registered_name" @click="goto_actor(actor_role.actor)")
      v-avatar(left)
        v-img(:src="avatar(actor_role.actor)")
      span {{actor_role.actor.public_name}}
</template>

<script>
  import {USER_GET_USER_DATA} from "../../store";

  export default {
    name: "EntryActorList",
    props: {
      actors: {
        type: Array
      }
    },
    methods: {
      avatar(actor) {
        return this.$api.url_actor__$registered_name__avatar(actor.registered_name)
      },
      goto_actor(actor) {
        if (false && actor.registered_name === this.$store.getters[USER_GET_USER_DATA].registered_name) {
          this.$router.push("/profile")
        } else {
          this.$router.push({path: "/actor", query: {name: actor.registered_name}})
        }
      }
    }
  }
</script>

<style scoped>

</style>
