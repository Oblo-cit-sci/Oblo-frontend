<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      SingleSelect(v-bind:options="options" v-bind:selection.sync="selectedItem" force_view="CLEAR_LIST")
</template>

<script>


  import SingleSelect from "../components/SingleSelect";

  const ld = require('lodash');
  // the available_entries

  const ENTRY_TYPE = "etype";
  const DRAFT = "draft";

  export default {
    name: "CreateEntry",
    async fetch({store, $axios}) { // {store, params}
      // TODO maybe a refetch after init to get new types...
    },
    data() {
      return {
        selectedItem: null,
      }
    },
    components: {SingleSelect},
    watch: {
      selectedItem() {
        let slug = "";
        let query = {};
        //console.log("SEL", this.selectedItem);
        if (this.selectedItem.type === ENTRY_TYPE)
          slug = this.selectedItem.key;
        else {
          slug = this.selectedItem.etype;
          query.draft_id = this.selectedItem.key;
        }
        this.$router.push({path: "create/" + slug, query: query})
      }
    },
    computed: {
      options() {
        // TODO actually should be an array ... ld.castArray
        let options = this.$store.getters.global_entry_types_as_array;
        options = ld.map(options, (o) => {return {title: o.title, key: o.slug, description: o.description, type:ENTRY_TYPE}});
        //console.log("CREATE Templates",templates);
        let drafts = ld.map(this.$store.state.edrafts.drafts, (d) => {
          return {title: d.title, key: d.draft_id, type:DRAFT, etype:d.slug}
        });
        //console.log("CREATE Drafts",drafts);
        if (ld.size(drafts) > 0) {
          options = ld.concat(
            options,
            {title: "Drafts"},
            drafts
          )
        }
        return options;
      }
    }
  }
</script>

<style scoped>


</style>
