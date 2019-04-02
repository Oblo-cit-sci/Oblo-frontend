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
      if(Object.keys(store.state.available_entries).length === 0) {
        const {data} = await $axios.get("/available_create_entries");
        if (data.status === "ok") {
          store.commit("available_create_entries", data.result.templates);
        }
      }
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
