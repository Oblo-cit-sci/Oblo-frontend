<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      v-list
        v-list-tile
          v-list-tile-title {{entry.title}}
          v-list-tile-sub-title {{entry.parent_type}}
        v-list-tile(@click="$router.push('/')")
          v-list-tile-title By {{entry.creator}}
          v-list-tile-sub-title At {{entry.creation_timestamp}}
        v-list-tile(dense)
          v-list-tile-title Description
        v-textarea(readonly solo flat no-resize :value="entry.description")
        v-flex(xs12 sm12 md12 text-xs-center)
          v-chip(v-for="tag in entry.tags" :key="tag.id") {{tag.title}}
            v-icon star
      ActorList(:actors="entry.actors")
    div {{entry}}
</template>

<script>

  import ActorList from "../../components/ActorList";


  export default {
    name: "entryview",
    components: {ActorList},
    async fetch(context) {
      // maybe before_create, to see if it has been fetched already
      let uuid =  context.params.entry_view;

      if (context.store.state.fetched_entries) {
        let {data} = await context.$axios.get("/entry/"+uuid);
        context.store.commit("add_fetched_entry", data.result)
      }


    },
    asyncData(context) {
      return {
        uuid: context.params.entry_view,
      }
    },
    data() {
      return {
        entry: null
      }
    },
    created() {
      this.entry = this.$store.state.fetched_entries[this.uuid]
    }
  }
</script>

<style scoped>

</style>
