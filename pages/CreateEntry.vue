<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      SingleSelect(v-bind:options="options" v-bind:selection.sync="selectedSlug" force_view="CLEAR_LIST")
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
        selectedSlug: null,
      }
    },
    components: {SingleSelect},
    watch: {
      selectedSlug() {
        let query = {};
        // ignore "Drafts"
        console.log(this.selectedSlug);
        this.selectedItem = this.$store.state.available_entries[this.$store.state.entry_type_slug_index_dict[this.selectedSlug]];

        if (!this.selectedItem.hasOwnProperty("slug"))
          return;
        if (this.selectedItem.hasOwnProperty("draft_id")) {
          query.draft_id = this.selection.draft_id;
          // TODO depracated
          this.$store.commit("select_creation_type", this.selectedItem.entryType);
        } else {
          // TODO depracated
          this.$store.commit("select_creation_type", this.selectedItem);
        }
        this.$router.push({path: "create/" + this.selectedItem.slug, query: query})
      }
    },
    computed: {
      options() {
        // TODO actually should be an array ... ld.castArray
        let templates = ld.filter(this.$store.state.available_entries, (e) => e.content.meta.context === "global");
        //console.log("CREATE Templates",templates);
        let drafts = this.$store.state.drafts;
        //console.log("CREATE Drafts",drafts);
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
