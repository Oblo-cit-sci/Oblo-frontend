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
        // ignore "Drafts"
        if (!this.selection.hasOwnProperty("slug"))
          return;
        if (this.selection.hasOwnProperty("draft_id")) {
          query.draft_id = this.selection.draft_id;
          this.$store.commit("select_creation_type", this.selection.entryType);
        } else {
          this.$store.commit("select_creation_type", this.selection);
        }
        //console.log("selection?", this.selection);

        this.$router.push({path: "create/" + this.selection.slug, query: query})
      }
    },
    computed: {
      options() {
        // TODO actually should be an array ... ld.castArray
        let templates = this.$store.state.available_entries;
        console.log("CREATE Templates",templates);
        let drafts = this.$store.state.drafts;
        console.log("CREATE Drafts",drafts);
        if (ld.size(drafts) > 0) {
          return ld.concat(
            templates,
            {"title": "Drafts"},
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
