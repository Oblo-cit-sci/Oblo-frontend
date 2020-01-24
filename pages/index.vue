<template lang="pug">
  v-container(fluid)
    v-row(align="center" justify="center")
      v-col(class="col-lg-6 col-xs-12")
        div(v-if="initialized" v-for="domain in domains" :key="domain.title")
          DomainCard(:domain="domain")
        div(v-else-if="!connecting" style="width:60%")
          v-alert(type="error" value="true" style="width:100%") Not initialized
          div(style="margin-top:10%")
            div check your network settings and retry again...
            v-btn(@click="initialize") Try again
            div(style="margin-top:5%") or load your offline data from your device
            v-btn Load your data
    v-row(v-if="partner_needs_update")
      v-btn(@click="reload_page") Update application
    v-row(justify="center")
      v-btn(text nuxt to="about") About The Project
      v-btn(text nuxt to="about#privacy") Privacy Policy
</template>

<script>

    import {mapGetters} from "vuex"

    import DomainCard from "../components/DomainCard";
    import {get_release_mode} from "../lib/util";
    import {LICCI_PARTNERS} from "../lib/consts";
    import {fix_add_licci_domain} from "../lib/fixes";

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
            }
            // doesnt do anything
            this.$store.watch(state => state.connecting, () => {
                this.connecting = this.$store.state.connecting
            })

            this.connected = this.$store.state.connected
            this.initialized = this.$store.state.initialized
            this.$store.watch(state => state.initialized, () => {
                this.initialized = this.$store.state.initialized
              fix_add_licci_domain(this.$store)
            })
            this.$store.commit("clear_domain")
        },
        components: {
            DomainCard
        },
        computed: {
            ...mapGetters(["domains"]),
          partner_needs_update() {
              return get_release_mode(this.$store) === LICCI_PARTNERS
          }
        },
        methods: {
          reload_page() {
            location.reload()
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
