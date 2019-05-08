<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      SingleSelect(v-bind:options="options" v-bind:selection.sync="selectedItem" force_view="CLEAR_LIST")
</template>

<script>


  import SingleSelect from "../components/SingleSelect";

  const ld = require('lodash');
  // the available_entries

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
        if (this.selectedItem.type === "etype")
          slug = this.selectedItem.key;
        else {
          console.log("DRAFT");
          slug = "";
        }
        console.log(slug);
        this.$router.push({path: "create/" + slug, query: query})
      }
    },
    computed: {
      options() {
        // TODO actually should be an array ... ld.castArray
        let options = this.$store.getters.global_entry_types_as_array;
        options = ld.map(options, (o) => {return {title: o.title, key: o.slug, description: o.description, type:"etype"}});
        //console.log("CREATE Templates",templates);
        let drafts = ld.map(this.$store.state.edrafts.drafts, (d) => {return {title: draft.title, key: d.draft_id}});
        //console.log("CREATE Drafts",drafts);
        if (ld.size(drafts) > 0) {
          options = ld.concat(
            options,
            {title: "Drafts", key: "_drafts", type:"draft"},
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
