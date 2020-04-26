<template lang="pug">
  div
    ActorList(:actors="actors")

</template>

<script>
  import ActorList from "~/components/actor/ActorList"

  export default {
    name: "admin",
    mixins: [],
    components: {ActorList},
    props: {},
    data() {
      return {
        actors: []
      }
    },
    computed: {},
    created() {
      this.$api.actor__get_all(true).then(({data}) => {
        this.actors = data.data
      })
    },
    methods: {}
  }
</script>

<style scoped>

</style>
