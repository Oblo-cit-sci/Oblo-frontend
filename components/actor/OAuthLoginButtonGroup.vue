<template lang="pug">
  div
    h2.mb-2(v-if="has_oauth_services") {{$t("comp.oauth_login.h")}}
    div(v-for="service in oauth_services" :key="service.service_name")
      v-btn(:href="service_link(service.service_name)")
        v-img.mr-1(:src="service.service_icon_url" width="20px")
        span {{$t("comp.oauth_login.sign_in_with",{service: service.service_name})}}
</template>

<script>

import {mapGetters} from "vuex"

export default {
  name: "OAuthLoginButtonGroup",
  computed: {
    ...mapGetters({oauth_services: "app/oauth_services"}),
    has_oauth_services() {
      return this.oauth_services.length > 0
    }
  },
  methods: {
    service_link(service_name) {
      return this.$api.basic.url_init_oauth(service_name)
    }
  }
}
</script>

<style scoped>

</style>
