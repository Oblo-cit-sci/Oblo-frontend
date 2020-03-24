<template lang="pug">
  v-app
    v-btn(style="bottom:2%" fixed dark fab bottom right x-large color="blue" @click="drawer = !drawer")
      v-icon mdi-menu
    v-bottom-sheet(
      v-if="small_display"
      app
      v-model="drawer"
      scrollable
      hide-overlay)
      v-card(tile height="400")
        v-card-text
          v-row
            v-col.col-sm-2
              v-btn(@click="back" nuxt)
                v-icon mdi-home
            //v-col.col-sm-3
              v-btn
                v-icon mdi-crosshairs-gps
            v-col.col-sm-2
              v-btn(@click="search_view" Search v-if="menu_mode === 'entry'")
                v-icon mdi-magnify
            v-col.col-sm-1.offset-sm-6
              v-btn(text :ripple="false" @click="drawer = !drawer")
                v-icon mdi-chevron-double-down
            Search(v-if="menu_mode === 'search'" v-on:received_search_results="update_map_entries($event)" :show_results="false" clean)
          EntryPreviewList(v-if="menu_mode === 'search'" :entries="entries" :preview_options="slim_preview_options", show)
          div.ma-1(v-if="menu_mode === 'entry'")
          v-row
            EntryAspectView.ma-1.pa-2(:entry="selected_entry" mode="view")
    v-navigation-drawer(
      v-else
      app
      :permanent="drawer"
      v-model="drawer"
      :mini-variant="false"
      :clipped="true"
      :hide-overlay="true"
      temporary
      :width="drawer_width"
      fixed)
      v-row
        v-col.col-sm-3
          v-btn(@click="back" nuxt)
            v-icon mdi-home
            span Back
        v-col.col-sm-7
          v-select(label="Layers" :items="layer_options" multiple small-chips v-on:change="layer_select_change($event)")
        v-col.col-sm-3
          v-btn
            v-icon mdi-crosshairs-gps
      v-row.ma-1(wrap justify-center)
        Search(v-if="menu_mode === 'search'"
          :preview_options="{actions: ['goto_location']}"
          v-on:received_search_results="update_map_entries($event)" clean)
        div.ma-1(v-if="menu_mode === 'entry'")
          v-row
            v-btn(@click="search_view" Search)
              v-icon mdi-magnify
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
    import {MAP_SET_ENTRIES} from "../lib/store_consts";
    import {string_list2options} from "../lib/options";
    import {SEARCH_GET_ENTRIES} from "../store/search";
    import {DOMAIN} from "../store";

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
                menu_mode: ENTRY
            }
        },
        created() {
            if(this.menu_mode === SEARCH) {
                const entries = this.$store.getters[SEARCH_GET_ENTRIES]
                this.update_map_entries(entries)
            }
        },
        computed: {
            ...mapGetters({entries: "map/entries", selected_entry: "map/selected_entry", layers: "map/layers"}),
            small_display() {
                return this.$vuetify.breakpoint.smAndDown
            },
            layer_options() {
               return string_list2options(this.layers)
            },
            slim_preview_options() {
                return {
                    show_title_action: true,
                    show_botton_actions: false,
                    show_date: false,
                    show_meta_aspects: false
                }
            },
            drawer_width() {
                return this.$vuetify.breakpoint.lgAndUp ? 600 : 400
            }
        },
        methods: {
            update_map_entries(entries) {
                this.$store.commit(MAP_SET_ENTRIES, entries)
            },
            ...mapMutations({"set_entries": "map/set_entries", "set_layer_status": "map/set_layer_status"}),
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
            },
            layer_select_change(active_layers) {
                this.set_layer_status(this.$_.mapValues(this.$_.keyBy(this.layers), l => active_layers.includes(l)))
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
    height: 100%;
    padding: 0;
  }

  .bggg {
    background-color: aliceblue;
  }
</style>
