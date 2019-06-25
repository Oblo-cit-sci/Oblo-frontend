<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='' class="column")
      SingleSelect(v-bind:options="options" v-bind:selection.sync="selectedItem" force_view="CLEAR_LIST" :highlight="false")
</template>

<script>

  import SingleSelect from "../components/SingleSelect";
  import {create_entry} from "../lib/entry";

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
        let entry_uuid = null;
        if (this.selectedItem.type === ENTRY_TYPE) {
          slug = this.selectedItem.value;
          entry_uuid = this.create_entry(slug);
        } else {
          entry_uuid = this.selectedItem.value;
        }
        this.$router.push("entry/" + entry_uuid)
      }
    },
    computed: {
      options() {
        // TODO actually should be an array ... ld.castArray
        let options = this.$store.getters.global_entry_types_as_array;
        // todo could be getters in the store. doesnt require title in the draft data...
        // todo clearer and unified
        options = ld.map(options, (o) => {
          return {text: o.title, value: o.slug, description: o.description, type: ENTRY_TYPE}
        });

        let drafts = ld.filter(Array.from(this.$store.state.entries.entries.values()), e => {return e.status === DRAFT})
        drafts = ld.map(drafts, d => {
          return {text: d.title, value: d.uuid, type: DRAFT}
        });
        // TODO-1 ciao
        if (ld.size(drafts) > 0) {
          options = ld.concat(
            options,
            {text: "Drafts"},
            drafts
          )
        }
        return options;
      }
    },
    methods: {
      create_entry(type_slug) {
        return create_entry(this.$store, type_slug).uuid
      }
    }
  }
</script>

<style scoped>


</style>
