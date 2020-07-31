<template lang="pug">
  v-chip.ml-1(@click="goto_actor(actor)" pill :color="visitor_color" :ripple="!is_visitor")
    v-avatar(left)
      v-img(:src="avatar(actor)")
    span(style="user-select:none") {{actor.public_name}}
    v-icon.pl-1(v-if="role") {{role_icon}}
</template>

<script>
  import ActorMixin from "~/components/actor/ActorMixin"

  export default {
    name: "ActorChip",
    mixins: [ActorMixin],
    props: {
      actor: {
        type: Object,
        required: true
      },
      role: String,
      selectable: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      role_icon() {
        // todo, these icons should be defined somewhere else
        switch (this.role) {
          case "creator":
            return "mdi-file-edit-outline"
          case "collaborator":
            return "mdi-pencil"
          case "shared":
            return "mdi-eye-outline"
          case "reviewer":
            return "mdi-file-document-box-check-outline" //"mdi-text-box-check"
          default: {
            console.log("unknown role", this.role)
            return ""
          }
        }
      },
      is_visitor() {
        return this.actor.registered_name === "visitor"
      },
      visitor_color() {
        if(this.is_visitor) {
          return "white"
        } else {
          return null
        }
      }
    }
  }
</script>

<style scoped>

</style>
