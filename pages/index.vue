<template lang="pug">
  v-container(fluid)
    div(v-if="!logged_in")
      v-row {{$t('page.index.p1', {server_name: server_name})}}
      v-row(align="center")
        v-col(sm="4" offset="1")
          v-btn.mt-4.mb-8(large to="/register" rounded outlined) {{$t('page.index.btn_register')}}
        v-col(sm="4")
          v-btn.mt-4.mb-8(large to="/login" rounded outlined) {{$t('page.index.btn_login')}}
    v-row(align="center" justify="center")
      v-col(class="col-lg-6 col-xs-12")
        div(v-for="domain in domains" :key="domain.name")
          DomainCard(
            v-if="domain_available_in_language(domain)"
            :domain_data="languaged_domain_data(domain)"
            :languages="languages(domain)")
          div(v-else)
            v-img.float-left.mr-3.mb-1(:src="domain_icon(domain.name)" left width="40" height="40")
            span {{domain.name}} is only available in {{languages(domain).join(", ")}}.
    v-row(justify="center")
      v-btn(text nuxt to="about") {{$t('page.index.about_a')}}
      v-btn(text nuxt to="about#privacy") {{$t('page.index.privacy_a')}}
    Footer
</template>

<script>

import {mapGetters} from "vuex"

import DomainCard from "../components/global/DomainCard";
import Footer from "../components/global/Footer";
import {CLEAR_DOMAIN, DOMAINS} from "../store";
import {USER_LOGGED_IN} from "~/store/user";
import {UI_LANGUAGE} from "~/lib/consts"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"

export default {
  mixins: [SettingsChangeMixin],
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
  methods: {
    domain_available_in_language(domain) {
      return !this.$_.isEmpty(this.languaged_domain_data(domain))
    },
    languaged_domain_data(domain) {
      return domain[this.setting(UI_LANGUAGE)]
    },
    domain_icon(domain_name) {
      return this.$api.static_url_$domain_name_icon(domain_name)
    },
    languages(domain) {
      return domain.languages.map(lang => this.$t("lang." + lang))
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
