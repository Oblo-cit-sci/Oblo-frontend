<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      Selector(v-bind:options="options" v-bind:selection.sync="selection")
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
        if (this.selection.hasOwnProperty("draft_id")) {
          query.draft_id = this.selection.draft_id;
        }
        this.$router.push({path: "create/" + this.selection.slug, query: query})
      }
    },
    computed: {
      options() {
        // TODO actually should be an array ... ld.castArray
        let templates = this.$store.state.available_entries;
        console.log("CREATEE_T",templates);
        let drafts = this.$store.state.drafts;
        console.log("CREATEE_",drafts);
        if (ld.size(drafts) > 0) {
          return Object.assign({},
            templates,
            {"Drafts": {"title": "Drafts", "slug": "_drafts"}},
            drafts
            )

        } else {
          return templates
        }
      }
    }
  }
</script>

<style scoped>


</style>
