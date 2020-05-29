<template lang="pug">
  v-chip.ml-1(@click="goto_actor(actor)" pill)
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
      actor: Object,
      role: String,
      selectable: {
        type: Boolean,
        default: true
      }
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
          case "reviewer":
            return "mdi-file-document-box-check-outline" //"mdi-text-box-check"
          default: {
            console.log("unknown role", this.role)
            return ""
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
