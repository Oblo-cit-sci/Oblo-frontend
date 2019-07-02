<template lang="pug">
  v-layout(xs6  justify-space-around align-center)
    div(v-if="initialized")
      entrylist(:entries="$store.state.entries.timeline_entries")
    div(v-else-if="!connecting" style="width:60%")
      v-alert(type="error" value="true" style="width:100%") Not initialized
      div(style="margin-top:10%")
        div check your network settings and retry again...
        v-btn(@click="initialize") Try again
        div(style="margin-top:5%") or load your offline data from your device
        v-btn Load your data
</template>

<script>

  import Entrylist from '~/components/Entrylist.vue'
  import {initialize} from "../lib/client"

  export default {
    data() {
      return {
        connecting: this.$store.state.connecting,
        connected: null,
        initialized: true // todo hacky, should be in the middleware
      }
    },
    created() {
      // todo
      // maybe in the middleware
      if (!this.$store.state.initialized) {
        this.initialize()
      }
      // doesnt do anything
      this.$store.watch(state => state.connecting, () => {
        this.connecting = this.$store.state.connecting
      })

      this.connected = this.$store.state.connected
      this.initialized = this.$store.state.initialized
      this.$store.watch(state => state.initialized, () => {
        this.initialized = this.$store.state.initialized
      })
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
