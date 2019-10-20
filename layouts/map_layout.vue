<template lang="pug">
  v-app
    v-btn(style="bottom:2%" fixed dark fab bottom right color="blue" @click="drawer = !drawer")
      v-icon mdi-menu
    v-bottom-sheet(
      v-model="drawer"
      scrollable
      hide-overlay)
      v-card(height="300")
        v-row(cols="12")
          v-col.col-sm-2
            v-btn(to="/" nuxt)
              v-icon home
              span home
          v-col.col-sm-2
            v-btn my location
              v-icon mdi-crosshairs-gps
          v-col.col-sm-2
            v-btn() search
              v-icon search
          v-col.col-sm-2(right)
            v-btn(text :ripple="false" @click="drawer = !drawer")
              v-icon mdi-chevron-double-down
        v-card-text
          Search(v-on:received_search_results="update_map_entries($event)" clean)
    v-content
      v-container(id="fullContainer")

    GlobalSnackbar
</template>

<script>

    // nuxt
    import GlobalSnackbar from "../components/GlobalSnackbar"
    import Entrypreview from "../components/EntryPreview"
    import {mapGetters} from "vuex"
    import Search from "../components/Search";
    import {mapMutations} from "vuex";

    const menu = [
        {
            icon: 'home',
            title: 'Home',
            to: '/'
        },
    ]
    export default {
        components: {GlobalSnackbar, Entrypreview, Search},
        data() {
            return {
                drawer: false,
                menu_items: menu
            }
        },
        computed: {
            ...mapGetters({entries: "entries/all_entries_array"})
        },
        methods: {
            update_map_entries(entries) {
                console.log(entries)
                //this.set_entries(entries)
                this.$store.commit("map/set_entries", entries)
            },
            ...mapMutations({"set_entries": "map/set_entries"})
        }
    }
</script>

<style>

  #fullContainer {
    max-width: 100%;
    padding: 0;
  }

  .bggg {
    background-color: aliceblue;
  }
</style>
