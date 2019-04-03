<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      Selector(v-bind:options="$store.state.available_entries" v-bind:selection.sync="selection")
</template>

<script>

  import Selector from "~~/components/Selector";

  //
  export default {
    name: "CreateEntry",
    async fetch({store, $axios}) { // {store, params}
      //console.log("CreateEntry.fetch");
      // TODO maybe a refetch after init to get new types...
    },
    data() {
      return {
        selection: null
      }
    },
    computed: {

    },
    components: {Selector},
    watch: {
      selection() {
        this.$router.push("create/"+this.selection)
      }
    }
  }
</script>

<style scoped>


</style>
