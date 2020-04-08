<template lang="pug">
  v-container(fluid)
    div(v-if="!logged_in")
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
    v-row(justify="center")
      v-btn(text nuxt to="about") About The Project
      v-btn(text nuxt to="about#privacy") Privacy Policy
    Footer
</template>

<script>

  import {mapGetters} from "vuex"

  import DomainCard from "../components/DomainCard";
  import Footer from "../components/Footer";
  import {CLEAR_DOMAIN, DOMAINS} from "../store";
  import {USER_LOGGED_IN} from "../store/user";

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
      ...mapGetters([DOMAINS]),
      ...mapGetters({logged_in: USER_LOGGED_IN}),
      server_name() {
        // todo
        return "OpenTEK.eu"
      },
    },
    methods: {}
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
