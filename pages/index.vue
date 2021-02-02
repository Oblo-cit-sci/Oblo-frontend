<template lang="pug">
  v-container(fluid)
    div(v-if="initialized")
      div(v-if="!logged_in")
        v-row(align="center")
          v-col(sm="4" offset="1")
            v-btn.mt-4.mb-8(text x-large rounded outlined :style="{background:'white'}" to="/register")
              v-icon(left) mdi-account-check
              span {{$t('page.index.btn_register')}}
          v-col(sm="4")
            v-btn.mt-4.mb-8(text x-large rounded outlined :style="{background:'white'}" to="/login")
              v-icon(left) mdi-login
              span {{$t('page.index.btn_login')}}
      v-row(align="center" justify="center")
        v-col(class="col-lg-6 col-xs-12")
          div(v-for="domain in visible_domains" :key="domain.name")
            DomainCard(
              v-if="domain_available_in_language(domain) && domain.name !== 'no_domain'"
              :domain_data="languaged_domain_data(domain)"
              :languages="languages(domain)")
            div(v-else)
              v-img.float-left.mr-3.mb-1(:src="domain_icon(domain.name)" left width="40" height="40")
              span {{domain.name}} is only available in {{languages(domain).join(", ")}}.

      iframe(width="560" height="315" src="https://www.youtube.com/embed/dMexZqK51YI" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen)
      v-row(justify="center")
        v-btn(text nuxt to="about") {{$t('page.index.about_a')}}
        v-btn(text nuxt to="about") {{$t('page.index.privacy_a')}}
    Footer
</template>

<script>

import {mapGetters} from "vuex"

import DomainCard from "../components/global/DomainCard";
import Footer from "../components/global/Footer";
import {NO_DOMAIN, UI_LANGUAGE} from "~/lib/consts"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import EnvMixin from "~/components/global/EnvMixin";

export default {
  mixins: [SettingsChangeMixin, EnvMixin],
  data() {
    return {}
  },
  created() {
    this.$store.commit("domain/clear_domain")
  },
  components: {
    Footer,
    DomainCard,
  },
  computed: {
    ...mapGetters({domains: "domain/domains"}),
    ...mapGetters({logged_in: "user/logged_in", initialized: "app/initialized"}),
    server_name() {
      // todo env.
      return this.hostname
    },
    visible_domains() {
      return this.domains.filter(d => d.name !== NO_DOMAIN)
    }
  },
  methods: {
    domain_available_in_language(domain) {
      return !this.$_.isEmpty(this.languaged_domain_data(domain))
    },
    languaged_domain_data(domain) {
      return this.$store.getters["domain/lang_domain_data"](domain.name, this.setting(UI_LANGUAGE))
    },
    domain_icon(domain_name) {
      return this.$api.static.domain_icon(domain_name)
    },
    languages(domain) {
      return domain.languages
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
