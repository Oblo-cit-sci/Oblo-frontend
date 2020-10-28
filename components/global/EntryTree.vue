<template lang="pug">
  v-container(fluid)
    v-row(wrap)
      v-col
        v-treeview(:items="tree" open-on-click)
          template(v-slot:prepend="{ item }")
            v-icon {{item.icon}}
            v-icon(v-if="item.outdated" color="orange") mdi-alert-outline
          template(v-slot:append="{ item }")
            v-icon(@click="to_entry(item.uuid)") mdi-arrow-right
</template>

<script>
import {entries2vuetify_tree} from "../../lib/entry_collections";


/**
 * not used atm
 */
export default {
      name: "EntryTree",
      mixins: [],
      components: {},
      props: {
        entries: Array
      },
      data() {
          return {

          }
      },
      created() {

      },
      computed: {
        tree() {
          return entries2vuetify_tree(entries, this.$store.getters["templates/entrytypes"], true)
        },
      },
      methods: {

      },
      watch: {

      }
}
</script>

<style scoped>

</style>
