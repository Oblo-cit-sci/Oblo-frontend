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
      v-row()
        v-col.col-6(class="col-xs-12" v-for="domain in visible_domains" :key="domain.name")
          DomainCard(
            :style="{'min-height':'320px'}"
            :domain_data="languaged_domain_overview(domain)"
            :languages="languages(domain)")
      v-row(justify="center")
        v-btn(text nuxt to="about") {{$t('page.index.about_a')}}
        v-btn(text nuxt to="about") {{$t('page.index.privacy_a')}}
    Footer
</template>

<script>

/*
prev else to
domaincard
            v-row(v-else)
              div
                v-img.float-left.mr-3.mb-1(:src="domain_icon(domain.name)" left width="40" height="40")
                span {{$t("page.index.domain_only_available_in_langs", {domain_name: domain.name, languages: language_names(domain)})}}
 */

import {mapGetters} from "vuex"

import DomainCard from "../components/global/DomainCard";
import Footer from "../components/global/Footer";
import {NO_DOMAIN, UI_LANGUAGE} from "~/lib/consts"
import SettingsChangeMixin from "~/components/global/SettingsChangeMixin"
import EnvMixin from "~/components/global/EnvMixin";
import LanguageMixin from "~/components/LanguageMixin";

export default {
  mixins: [SettingsChangeMixin, EnvMixin, LanguageMixin],
  data() {
    return {}
  },
  created() {
    this.$store.dispatch("domain/clear_domain", this.$store.getters.ui_language)
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
      return this.domains().filter(d => d.name !== NO_DOMAIN)
    },
  },
  methods: {
    domain_available_in_language(domain) {
      return !this.$_.isEmpty(this.languaged_domain_overview(domain))
    },
    languaged_domain_overview(domain) {
      const d = this.$store.getters["domain/domain_overview"](domain.name, this.setting(UI_LANGUAGE))
      d.name = domain.name
      return d
    },
    domain_icon(domain_name) {
      return this.$api.static.domain_icon(domain_name)
    },
    languages(domain) {
      return domain.languages
    },
    language_names(domain) {
      return this.languages(domain).map(lc => this.t_lang(lc))
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
