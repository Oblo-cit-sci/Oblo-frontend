<template lang="pug">
  v-layout(justify-center)
    v-flex(xs12 md8)
      SingleSelect(
        :options="options"
        force_view="CLEAR_LIST"
        :select_sync="false"
        v-on:selection="selection($event)"
        :highlight="false")
</template>

<script>

  import SingleSelect from "../components/SingleSelect";
  import {create_entry, has_parent} from "../lib/entry";

  import { format } from 'timeago.js';
  import {ENTRIES_DRAFTS} from "../lib/store_consts";

  const ENTRY_TYPE = "etype";
  const DRAFT = "draft";

  export default {
    name: "CreateEntry",
    components: {SingleSelect},
    methods: {
      selection({type, value}) {
        let uuid = null
        if (type === ENTRY_TYPE) {
          uuid = create_entry(this.$store, value).uuid
        } else {
          uuid = value;
        }
        this.$router.push("entry/" + uuid)
      }
    },
    computed: {
      options() {
        let options = this.$_.map(this.$store.getters.global_entry_types_as_array, o => {
          return {
            text: o.title,
            value: o.slug,
            type: ENTRY_TYPE,
            description: o.description,
            }
        });

        let drafts = this.$_.filter(this.$store.getters[ENTRIES_DRAFTS](),
          e => {
            return !has_parent(e)
          })
        drafts = this.$_.map(drafts, d => {
          return {
            text: d.title,
            value: d.uuid,
            type: DRAFT,
            description: "Created " + format(d.creation_datetime)}
        });
        if(drafts.length > 0 ){
          options.push({text: "Drafts", type: "category"}, ...drafts)
        }
        return options;
      }
    }
  }
</script>

<style scoped>


</style>
