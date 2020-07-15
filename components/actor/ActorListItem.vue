<template lang="pug">
  v-list-item
    v-list-item-avatar()
      v-img.pointer(:src="avatar(actor)"  @click="goto_actor(actor)")
    v-list-item-content
      v-list-item-title
        span.pointer(@click="goto_actor(actor)")
          span {{actor.public_name}}
          span(style="font-size:small") &nbsp; {{actor.registered_name}}
        v-chip.ml-2(v-if="actor.account_deactivated" small color="indianred") {{$t("comp.actor.deactivated")}}
        GlobalRoleChip.ml-2(:global_role="actor.global_role")
      v-list-item-subtitle {{actor.description}}
      v-list-item-subtitle {{place(actor.location)}}
</template>

<script>
import ActorMixin from "~/components/actor/ActorMixin"
import GlobalRoleChip from "~/components/actor/GlobalRoleChip"

export default {
  name: "ActorListItem",
  mixins: [ActorMixin],
  components: {GlobalRoleChip},
  props: {},
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>
  .pointer {
    cursor:pointer;
  }
</style>
