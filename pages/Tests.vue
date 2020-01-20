<template lang="pug">
  v-container(fluid)
</template>

<script>


  import {merge_imported_entries} from "../lib/import_export";

  // import test_data from "../lib/test_files/entry_merge_test_entries.json"
  import {ENTRIES_ALL_ENTRIES_ARRAY} from "../lib/store_consts";

  const ld = require("lodash")

  export default {
    name: "Tests",
    components: {},
    mounted() {
    },
    created() {
      this.test_init()
    },
    data() {
      return {}
    },
    computed: {},
    methods: {
      test_init() {
        // test_data.entries.forEach(entry => {
        //   entry.creation_datetime = new Date(entry.creation_datetime)
        //   entry.local = {
        //     dirty: false,
        //     prev: null,
        //   }
        //   //this.$store.commit(ENTRIES_SAVE_ENTRY, entry)
        // })

        // test first import
        const result = merge_imported_entries(this.$store, test_data.entries)
        console.log(result.length === 7)
        // 2nd import should result in 0
        console.log(merge_imported_entries(this.$store, test_data.entries).length === 0)
        // get all entries, should be 7
        console.log(this.$store.getters[ENTRIES_ALL_ENTRIES_ARRAY]().length === 7)
        return result
      },
    }
  }
</script>

<style scoped>

</style>
