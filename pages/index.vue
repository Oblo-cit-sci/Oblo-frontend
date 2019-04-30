<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    v-flex(xs12='' sm8='' md6='')
      entrylist(:entries="$store.state.recent_entries")
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
