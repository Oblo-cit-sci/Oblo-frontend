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

    import Entrylist from '../components/Entrylist.vue'
    import {fix_entries, initialize} from "../lib/client"

    export default {
        data() {
            return {
                connecting: false,
                connected: null,
                initialized: this.$store.state.initialized,
            }
        },
        created() {
            // todo
            // maybe in the middleware
            if (!this.initialized) {
                this.connecting = true
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
                //fix_entries(this.$store)
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

  #temp_alert {
    color: black;
  }

  input {
    border-style: solid;
  }
</style>
