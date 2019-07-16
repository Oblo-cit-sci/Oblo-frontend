<template>
  <v-app>
    <v-content>
      <v-container id="fullContainer">
        <nuxt/>
      </v-container>
    </v-content>
    <GlobalSnackbar></GlobalSnackbar>
  </v-app>
</template>

<script>

  import GlobalSnackbar from "../components/GlobalSnackbar"

  export default {
    components: {GlobalSnackbar},
  }
</script>

<style>

  #fullContainer {
    max-width: 100%;
    padding: 0;
  }

</style>
