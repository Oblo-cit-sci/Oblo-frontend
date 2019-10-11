<template>
  <v-app>
    <v-navigation-drawer
      app
      v-model="drawer"
      :mini-variant="false"
      :clipped="true"
      :hide-overlay="true"
      temporary
      width="500"
      fixed
    />
    <v-content>
      <v-container id="fullContainer">
        <nuxt/>
      </v-container>
    </v-content>
    <v-btn
      style="bottom:2%"
      fixed
      dark
      fab
      bottom
      right
      color="blue"
      @click="drawer = !drawer"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <GlobalSnackbar></GlobalSnackbar>
  </v-app>
</template>

<script>

    import GlobalSnackbar from "../components/GlobalSnackbar"

    export default {
        components: {GlobalSnackbar},
        data() {
            return {
                drawer: false
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
