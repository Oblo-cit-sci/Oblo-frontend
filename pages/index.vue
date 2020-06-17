<template lang="pug">
  v-container(fluid)
    div(v-if="!logged_in")
      v-row {{$t('index.p1', {server_name: server_name})}}
      v-row(align="center")
        v-col(sm="4" offset="1")
          v-btn.mt-4.mb-8(large to="/register" rounded outlined) {{$t('index.btn_register')}}
        v-col(sm="4")
          v-btn.mt-4.mb-8(large to="/login" rounded outlined) {{$t('index.btn_login')}}
    v-row(align="center" justify="center")
      v-col(class="col-lg-6 col-xs-12")
        div(v-for="domain in domains" :key="domain.title")
          DomainCard(:set_domain_data="domain")
    v-row(justify="center")
      v-btn(text nuxt to="about") {{$t('index.about_a')}}
      v-btn(text nuxt to="about#privacy") {{$t('index.privacy_a')}}
    Footer
</template>

<script>

  import {mapGetters} from "vuex"

  import DomainCard from "../components/global/DomainCard";
  import Footer from "../components/global/Footer";
  import {CLEAR_DOMAIN, DOMAINS} from "../store";
  import {USER_LOGGED_IN} from "~/store/user";

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
