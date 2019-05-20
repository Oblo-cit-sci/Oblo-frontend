<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      entrylist(:entries="$store.state.entries.timeline_entries")
</template>

<script>
  import Entrylist from '~/components/Entrylist.vue'

  import { initialize } from "~/lib/client"

  export default {
    async fetch(context) {
      if (!context.store.state.initialized) {
        await initialize(context.$axios, context.store);
      }
    },
    created() {
      //console.log(this.$store.getters);
    },
    components: {
      Entrylist
    },
    computed: {}
  }
</script>

<style>

  .form {
    background-color: #424242;
  }

  input {
    border-style: solid;
  }
</style>
