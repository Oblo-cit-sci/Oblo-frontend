<template lang="pug">
  v-flex(xs12='' sm8='' md6='')
    TreeleafPicker(v-bind:tree="$store.state.tags")
</template>

<script>

  // TreeleafPicker(:tree="store.state.tags")
  import TreeleafPicker from "../components/TreeleafPicker"
  import Datepicker from '../components/Datepicker.vue'

  export default {
    name: "Tests.vue",
    components: {
      TreeleafPicker, Datepicker
    }
  }
</script>

<style scoped>

</style>
