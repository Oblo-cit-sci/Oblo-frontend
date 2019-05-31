<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    div(v-if="$store.initialized")
      entrylist(:entries="$store.state.entries.timeline_entries")
    div(v-else style="width:60%")
      v-alert(type="error" value="true" style="width:100%") Not initialized
      div(style="margin-top:10%")
        div check your network settings and retry again...
        v-btn Try again
        div(style="margin-top:5%") or load your offline data from your device
        v-btn Load your data
</template>

<script>

  // v-flex(xs12='' sm8='' md6='')
  import Entrylist from '~/components/Entrylist.vue'

  import {initialize} from "~/lib/client"

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
