<template lang="pug">
  v-app
    v-btn(style="bottom:2%" fixed dark fab bottom right color="blue" @click="drawer = !drawer")
      v-icon mdi-menu
    v-bottom-sheet(
      v-if="small_display"
      app
      v-model="drawer"
      scrollable
      hide-overlay)
      v-card.ma-1(height="400")
        v-card-text
          v-row
            v-col.col-sm-2
              v-btn(@click="back" nuxt)
                v-icon home
                span
            //v-col.col-sm-3
              v-btn
                v-icon mdi-crosshairs-gps
            v-col.col-sm-2
              v-btn(v-if="menu_mode === 'entry'")
                v-icon search
            v-col.col-sm-1.offset-sm-6
              v-btn(text :ripple="false" @click="drawer = !drawer")
                v-icon mdi-chevron-double-down
            Search(v-on:received_search_results="update_map_entries($event)" :show_results="false" clean)
          EntryPreviewList(:entries="entries" :preview_options="slim_preview_options", show)
    v-navigation-drawer(
      v-else
      app
      :permanent="drawer"
      v-model="drawer"
      :mini-variant="false"
      :clipped="true"
      :hide-overlay="true"
      temporary
      width="400"
      fixed)
      v-row
        v-col.col-sm-3
          v-btn(@click="back" nuxt)
            v-icon home
            span Back
        //v-col.col-sm-3
          v-btn
            v-icon mdi-crosshairs-gps
      v-row.ma-1(wrap justify-center)
        Search(v-if="menu_mode === 'search'"
          v-on:received_search_results="update_map_entries($event)" clean)
        div.ma-1(v-if="menu_mode === 'entry'")
          v-row
            v-btn(@click="search_view" Search)
              v-icon search
          EntryAspectView.ma-1.pa-2(:entry="selected_entry" mode="view")
    v-content
      v-container(id="fullContainer")
        nuxt
    GlobalSnackbar
</template>

<script>

    // nuxt
    import GlobalSnackbar from "../components/GlobalSnackbar"
    import Entrypreview from "../components/EntryPreview"
    import {mapGetters} from "vuex"
    import Search from "../components/Search";
    import {mapMutations} from "vuex";
    import EntryPreviewList from "../components/EntryPreviewList";
    import EntryAspectView from "../components/EntryAspectView";
    import {NO_DOMAIN} from "../lib/consts";
    import {DOMAIN} from "../lib/store_consts";

    const SEARCH = "search"
    const ENTRY = "entry"
    const menu_mode_options = [SEARCH, ENTRY]


    const menu = [
        {
            icon: 'home',
            title: 'Home',
            to: '/'
        },
    ]
    export default {
        components: {GlobalSnackbar, Entrypreview, Search, EntryPreviewList, EntryAspectView},
        data() {
            return {
                drawer: false,
                menu_items: menu,
                menu_mode: SEARCH
            }
        },
        computed: {
            ...mapGetters({entries: "map/entries", selected_entry: "map/selected_entry"}),
            small_display() {
                return this.$vuetify.breakpoint.smAndDown
            },
            slim_preview_options() {
                return {
                    show_title_action: true,
                    show_botton_actions: false,
                    show_date: false,
                    show_meta_aspects: false
                }
            }
        },
        methods: {
            update_map_entries(entries) {
                //console.log("update_map_entries", entries)
                //this.set_entries(entries)
                this.$store.commit("map/set_entries", entries)
            },
            ...mapMutations({"set_entries": "map/set_entries"}),
            search_view() {
                this.menu_mode = SEARCH
            },
            back() {
                // todo copy of entryNavMixin
                let domain = this.$store.getters[DOMAIN]
                if (domain.value === NO_DOMAIN) {
                    this.$router.push("/")
                } else {
                    // todo could be a bit nicer (named router, route param...)
                    this.$router.push("/domain/" + domain.value)
                }
            }
        },
        watch: {
            selected_entry(val) {
                this.drawer = true
                this.menu_mode = ENTRY
            }
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
