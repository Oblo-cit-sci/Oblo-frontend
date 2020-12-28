<template lang="pug">
  v-chip.ml-1(@click="goto_actor(actor)" pill :color="visitor_color" :ripple="!is_visitor")
    v-avatar(left)
      v-img(:src="avatar(actor)")
    span(style="user-select:none") {{actor.public_name}}
    v-icon.pl-1(v-if="role") {{role_icon}}
</template>

<script>
  import ActorMixin from "~/components/actor/ActorMixin"
  import {COLLABORATOR, CREATOR, REVIEWER, ROLE_ICONS, SHARED} from "~/lib/actors";

  export default {
    name: "ActorChip",
    mixins: [ActorMixin],
    props: {
      role: String
    },
    computed: {
      role_icon() {
        return ROLE_ICONS[this.role]
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
