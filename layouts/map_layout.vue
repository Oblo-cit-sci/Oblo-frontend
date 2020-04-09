<template lang="pug">
  v-app
    v-content
      v-container(id="fullContainer")
        nuxt
      GlobalSnackbar
</template>

<script>
import GlobalSnackbar from "../components/GlobalSnackbar";
export default {
      name: "map_layout",
      mixins: [],
      components: {GlobalSnackbar},
}
</script>

<style scoped>


  #fullContainer {
    max-width: 100%;
    padding: 0;
    height: 100%;
  }
</style>
