<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    TreleafPicker2(:tree="$store.state.tags")

</template>

<script>

  import TreleafPicker2 from "../components/TreleafPicker2";

  export default {
    name: "Tests.vue",
    components: {
      TreleafPicker2
    }
  }
</script>

<style scoped>

</style>
