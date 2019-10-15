<template lang="pug">
  v-app
    v-btn(style="bottom:2%" fixed dark fab bottom right color="blue" @click="drawer = !drawer")
      v-icon mdi-menu
    v-navigation-drawer(
      app
      v-model="drawer"
      :mini-variant="false"
      :clipped="true"
      :hide-overlay="true"
      temporary
      width="400"
      fixed)
      v-row(wrap justify-center)
        v-col(cols=12 v-for="entry in entries"
          :key="entry.id" class="col-sm-12 col-xs-12")
          Entrypreview(:entry="entry")
    v-content
      v-container(id="fullContainer")
        nuxt
    GlobalSnackbar
</template>

<script>

    import GlobalSnackbar from "../components/GlobalSnackbar"
    import Entrypreview from "../components/EntryPreview"
    import {mapGetters} from "vuex"

    const menu = [
        {
            icon: 'home',
            title: 'Home',
            to: '/'
        },
    ]
    export default {
        components: {GlobalSnackbar, Entrypreview},
        data() {
            return {
                drawer: false,
                menu_items: menu
            }
        },
        computed: {
            ...mapGetters({entries: "entries/all_entries_array"})

        }
    }
</script>

<style>

  #fullContainer {
    max-width: 100%;
    padding: 0;
  }

</style>
