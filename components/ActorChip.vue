<template lang="pug">
  v-chip.ml-1(@click="goto_actor(actor)" pill)
    v-avatar(left)
      v-img(:src="avatar(actor)")
    span(style="user-select:none") {{actor.public_name}}
    v-icon.pl-1(v-if="role") {{role_icon}}

</template>

<script>
  import {USER_GET_USER_DATA} from "~/store"
  import {VISITOR} from "~/lib/consts"

  export default {
    name: "ActorChip",
    props: {
      actor: Object,
      role: String
    },
    computed: {
      role_icon() {
        switch (this.role) {
          case "creator":
            return "mdi-file-edit-outline"
          case "collaborator":
            return "mdi-pencil"
          case "shared":
            return "mdi-eye-outline"
          default: {
            console.log("unknown role", this.role)
            return ""
          }
        }
      }
    },
    methods: {
      avatar(actor) {
        return this.$api.url_actor__$registered_name__avatar(actor.registered_name)
      },
      goto_actor(actor) {
        if (actor.registered_name === VISITOR)
          return
        if (actor.registered_name === this.$store.getters[USER_GET_USER_DATA].registered_name) {
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
