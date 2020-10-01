<template lang="pug">
  v-avatar.mr-1(size="40" @click="goto_actor(actor)")
    v-img(:src="avatar(actor)")
</template>

<script>
import ActorMixin from "~/components/actor/ActorMixin"

export default {
  name: "ActorAvatar",
  mixins: [ActorMixin],
  components: {},
  props: {
    actor: {
      type: Object,
      required: true
    },
  },
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
