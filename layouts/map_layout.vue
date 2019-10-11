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
    v-content
      v-container(id="fullContainer")
        nuxt
    GlobalSnackbar
</template>

<script>

    import GlobalSnackbar from "../components/GlobalSnackbar"

    const menu = [
        {
            icon: 'home',
            title: 'Home',
            to: '/'
        },
    ]
    export default {
        components: {GlobalSnackbar},
        data() {
            return {
                drawer: false,
                menu_items: menu
            }
        }
    }
</script>

<style>

  #fullContainer {
    max-width: 100%;
    padding: 0;
  }

</style>
