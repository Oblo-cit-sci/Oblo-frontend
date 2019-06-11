<template lang="pug">
  v-layout(column='' justify-center='' align-center='')
    div(v-if="initialized")
      entrylist(:entries="$store.state.entries.timeline_entries")
    div(v-else style="width:60%")
      v-alert(type="error" value="true" style="width:100%") Not initialized
      div(style="margin-top:10%")
        div check your network settings and retry again...
        v-btn(@click="initialize") Try again
        div(style="margin-top:5%") or load your offline data from your device
        v-btn Load your data
</template>

<script>

  // v-flex(xs12='' sm8='' md6='')
  import Entrylist from '~/components/Entrylist.vue'

  import {initialize} from "../lib/client"

  export default {
    async fetch(context) {
      if (!context.store.state.initialized) {
        //console.log("FETCH INIT")
        await initialize(context.$axios, context.store)
      }
    },
    data() {
      return {
        initialized: false
      }
    },
    created() {
      //console.log(this.$store.getters);
      this.initialized = this.$store.state.initialized
      this.$store.watch(state => state.initialized, () => {
        this.initialized = this.$store.state.initialized
        console.log("index create watcher change", this.$store.state.initialized)
      })
      //this.$store.dispatch("test", "cool")
    },
    components: {
      Entrylist
    },
    methods: {
      initialize() {
        initialize(this.$axios, this.$store)
      }
    }
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
