<template lang="pug">
  v-container(fluid)
    v-row(v-if="!logged_in && connected" align="center")
      v-col(cols=2 offset="4")
        v-btn(large to="/register") Register
      v-col(cols=2)
        v-btn(large to="/login") Login
    v-row(align="center" justify="center")
      v-col(class="col-lg-6 col-xs-12")
        div(v-for="domain in domains" :key="domain.title")
          DomainCard(:domain="domain")
    v-row(v-if="partner_needs_update")
      v-btn(@click="reload_page") Update application
    v-row(justify="center")
      v-btn(text nuxt to="about") About The Project
      v-btn(text nuxt to="about#privacy") Privacy Policy
    Footer(v-if="not_partner")
</template>

<script>

  import {mapGetters} from "vuex"

  import DomainCard from "../components/DomainCard";
  import {get_release_mode} from "../lib/util";
  import {LICCI_PARTNERS} from "../lib/consts";
  import {CLEAR_DOMAIN, CONNECTED, DOMAINS, USER_LOGGED_IN} from "../lib/store_consts";

  export default {
    data() {
    },
    created() {
      this.$store.commit(CLEAR_DOMAIN)
    },
    components: {
      DomainCard
    },
    computed: {
      ...mapGetters([DOMAINS, CONNECTED]),
      ...mapGetters({logged_in: USER_LOGGED_IN}),
      not_partner() {
        return get_release_mode(this.$store) !== LICCI_PARTNERS
      },
      // todo should make a request to the uab page.
      partner_needs_update() {
        return this.release_mode === LICCI_PARTNERS
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
