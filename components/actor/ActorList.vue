<template lang="pug">
  div
    v-list(three-line)
      template(v-for="actor in actors")
        ActorListItem(:actor="actor" :key="actor.registered_name")
        v-divider
</template>

<script>
  import ActorListItem from "~/components/actor/ActorListItem"

  export default {
    name: "ActorList",
    mixins: [],
    components: {ActorListItem},
    props: {
      actors: Array
    },
    data() {
      return {}
    },
    computed: {},
    methods: {

    }
  }
</script>

<style scoped>

</style>
