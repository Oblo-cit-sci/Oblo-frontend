<template lang="pug">
  v-container.pb-0(fluid)
    div(v-if="initialized")
      div(v-if="!logged_in")
        v-row.mb-2.mb-sm-5.pb-3.pb-md-1(align="center")
          v-col.py-0.mt-0.mt-md-4.mb-md-3(sm="4" offset-md="1")
            v-btn.mt-4.mb-md-3(text :x-large="x_large_btn" rounded outlined :style="{background:'white'}" to="/register")
              v-icon(left) mdi-account-check
              span {{$t('page.index.btn_register')}}
          v-col.py-0.mt-0.mt-md-4.mb-md-3(sm="4")
            v-btn.mt-4.mb-md-3(text :x-large="x_large_btn" rounded outlined :style="{background:'white'}" to="/login")
              v-icon(left) mdi-login
              span {{$t('page.index.btn_login')}}
      v-row()
        v-col.col-sm-12.col-md-6.py-0(v-for="domain in visible_domains" :key="domain.name")
          DomainCard(
            :style="{'max-height':'320px'}"
            :domain_data="languaged_domain_overview(domain)"
            :languages="languages(domain)")
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
import LanguageMixin from "~/components/LanguageMixin";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";

export default {
  name: "index",
  mixins: [SettingsChangeMixin, EnvMixin, LanguageMixin, ResponsivenessMixin],
  head() {
    return {
      link: [
        {
          rel: "authorization_endpoint",
          href: `${this.env.hostname}/auth`
        }
      ]
    }
  },
  data() {
    return {}
  },
  created() {
    this.$store.dispatch("domain/clear_domain", this.$store.getters.ui_language)
    // this was the only reliable way to consistently change (and keep) the window title
    this.$nuxt.$options.head.title = this.$store.getters["app/platform_data"].title
    // console.log(this.visible_domains.length)
  },
  components: {
    Footer,
    DomainCard,
  },
  computed: {
    ...mapGetters({domains: "domain/domains"}),
    ...mapGetters({logged_in: "user/logged_in", initialized: "app/initialized"}),
    visible_domains() {
      return this.$_.sortBy(this.domains().filter(d => d.name !== NO_DOMAIN), ["index"])
    },
    x_large_btn() {
      return this.is_mdAndUp
    },
  },
  methods: {
    languaged_domain_overview(domain) {
      const d = this.$store.getters["domain/domain_overview"](domain.name, this.setting(UI_LANGUAGE))
      d.name = domain.name
      return d
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
