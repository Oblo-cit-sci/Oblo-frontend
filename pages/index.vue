<template lang="pug">
  v-container(fluid)
    v-row(align="center" justify="center")
      v-col(class="col-lg-6 col-xs-12")
        div(v-if="initialized")
          DomainCard(v-for="domain in domains" :key="domain.title" v-bind="domain")
        div(v-else-if="!connecting" style="width:60%")
          v-alert(type="error" value="true" style="width:100%") Not initialized
          div(style="margin-top:10%")
            div check your network settings and retry again...
            v-btn(@click="initialize") Try again
            div(style="margin-top:5%") or load your offline data from your device
            v-btn Load your data
</template>

<script>

    // div(v-if="initialized")
    //   entrylist(:entries="$store.state.entries.timeline_entries")

    import {initialize} from "../lib/client"
    import DomainCard from "../components/DomainCard";

    export default {
        data() {
            return {
                connecting: false,
                connected: null,
                initialized: this.$store.state.initialized,
                domains: [{
                    title: "LICCI",
                    to: "/domain/licci",
                    img_src: "images/licci.jpg",
                    text: "Local Indicators of Climate Change Impacts - The Contribution of Local Knowledge to Climate Change Research"
                }, {
                    title: "CONECTE",
                    to: "/domain/conecte",
                    img_src: "images/conecte.jpg",
                    text: "Compartiendo el CONocimiento ECológico Tradicional - Una plataforma interactiva de recogida y transmisión de conocimientos tradicionales relativos a plantas, animales, hongos, variedades tradicionales de cultivos o ecosistemas"
                }]
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
            this.$store.commit("clear_domain")
        },
        components: {
            DomainCard
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
