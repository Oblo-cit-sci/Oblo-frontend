<template lang="pug">
  v-container(fluid)
    div(v-if="!logged_in && connected")
      v-row With an account on {{server_name}} you'll be able to create entries and join groups.
      v-row(align="center")
        v-col(sm="4" offset="1")
          v-btn.mt-4.mb-8(large to="/register" rounded outlined) Register
        v-col(sm="4")
          v-btn.mt-4.mb-8(large to="/login" rounded outlined) Login
      v-row You can browse through public entries in these domains.
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
  import Footer from "../components/Footer";

  export default {
    data() {
      return {}
    },
    created() {
      this.$store.commit(CLEAR_DOMAIN)
    },
    components: {
      Footer,
      DomainCard,
    },
    computed: {
      ...mapGetters([DOMAINS, CONNECTED]),
      ...mapGetters({logged_in: USER_LOGGED_IN}),
      server_name() {
        // todo
        return "OpenTEK.eu"
      },
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
