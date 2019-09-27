<template lang="pug">
  v-flex(xs12 sm12 md12 text-xs-center)
    v-list(v-for="(actor_type_list, actor_type) in actors" :key="actor_type")
      v-list-tile(v-if="has_actors(actor_type_list)")
        v-list-tile-title {{actor_type}}
      v-list-tile(v-for="actor in actor_type_list" :key="actor.registered_name" avatar)
        v-list-tile-avatar
          img(:src="default_avatar")
        v-list-tile-title {{actor.username}}

</template>

<script>



  export default {
    props: {"actors": Object},
    name: "ActorList",
    data() {
      return {
        default_avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg"
      }
    },
    methods: {
      has_actors(actor_list) {
        return this.$_.size(actor_list) > 0
      }
    }

  }
</script>

<style scoped>

</style>
