<template lang="pug">
  div
    CompleteActorIndex

</template>

<script>
import ActorList from "~/components/actor/ActorList"
import CompleteActorIndex from "~/components/actor/CompleteActorIndex";

export default {
  name: "admin",
  mixins: [],
  components: {CompleteActorIndex, ActorList},
  props: {},
  data() {
    return {
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
