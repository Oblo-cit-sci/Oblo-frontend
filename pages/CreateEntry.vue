<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      SingleSelect(v-bind:options="options" v-bind:selection.sync="selectedItem" force_view="CLEAR_LIST")
</template>

<script>


  import SingleSelect from "../components/SingleSelect";
  //import { create_draft_title } from "~~/lib/entry";
  import Entry from "../lib/entry";


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

        let entry_id = null;
        if (this.selectedItem.type === ENTRY_TYPE) {
          slug = this.selectedItem.key;
          entry_id = this.create_entry(slug);
        } else {
          slug = this.selectedItem.type_slug;
          entry_id = this.selectedItem.key;
        }
        this.$router.push("create/" + slug + "/"+ entry_id)
      }
    },
    computed: {
      options() {
        // TODO actually should be an array ... ld.castArray
        let options = this.$store.getters.global_entry_types_as_array;
        // todo could be getters in the store. doesnt require title in the draft data...
        // todo clearer and unified
        options = ld.map(options, (o) => {
          return {title: o.title, key: o.slug, description: o.description, type: ENTRY_TYPE}
        });
        //console.log("CREATE Templates",templates);
        let drafts = ld.map(this.$store.state.edrafts.drafts, (d) => {
          return {title: d.title, key: d.draft_id, type: DRAFT, type_slug: d.type_slug}
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
    },
    methods: {
      create_entry(type_slug) {
        let entry_type = this.$store.getters.entry_type(type_slug);
        let aspects = entry_type.content.aspects;
        let draft_id = this.$store.state.edrafts.next_id;

        for (let aspect_i in aspects) {
          let aspect = aspects[aspect_i];
        // todo this happens already in MAspectComponent
          aspect.attr = aspect.attr || {};
          if ((aspect.attr.view || "inline") === "page") {
            aspect.attr.draft_id = this.draft_id;
            aspect.attr.aspect_index = aspect_i;
          }
        }

        let entry = new Entry({
            entry_type: entry_type,
            draft_id: draft_id,
            license:  this.$store.state.user.user_data.defaultLicense,
            privacy: this.$store.state.user.user_data.defaultPrivacy,
          });
        // todo maybe some redundant data here...
        this.$store.commit("edrafts/create_draft", entry.get_store_data());

        return draft_id;
      }
    }
  }
</script>

<style scoped>


</style>
