<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      Selector(v-bind:options="$store.state.available_entries" v-bind:selection.sync="selection")
      div(v-if="has_drafts")
        Selector(v-bind:options="$store.state.drafts" v-bind:selection.sync="selection")
      div {{$store.state.drafts}}
</template>

<script>

  import Selector from "~~/components/Selector";

  const ld = require('lodash');
  // the available_entries

  export default {
    name: "CreateEntry",
    async fetch({store, $axios}) { // {store, params}
      // TODO maybe a refetch after init to get new types...
    },
    data() {
      return {
        selection: null,
      }
    },
    components: {Selector},
    watch: {
      selection() {
        let query = {};
        if(this.selection.hasOwnProperty("draft_id")) {
          query.draft_id = this.selection.draft_id;
        }
        this.$router.push({path:"create/"+this.selection.slug, query:query})
      }
    },
    computed: {
      has_drafts() {
        return ld.size(this.$store.state.drafts) > 0
      }
    }
  }
</script>

<style scoped>


</style>
