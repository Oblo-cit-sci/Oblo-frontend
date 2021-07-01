<template lang="pug">
  v-row
    v-col(v-if="!this.$vuetify.breakpoint.sm && !this.$vuetify.breakpoint.xs")
      v-card.white.text-center(flat tile)
        v-card-text.pb-0.pt-0
          v-btn.mx-4.white--text(v-for="item in footer_data"
            :key="item.logo" :href="item.link" target="_blank" text small)
            v-img(:src="item.logo"  width="70" contain)
    v-col.py-1(v-if="this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.xs")
      v-card.white.text-center(flat tile)
        v-card-text.pb-0.pt-0
          v-carousel(height="100%" hide-delimiters=true cycle=true :show-arrows="this.$vuetify.breakpoint.sm")
            v-carousel-item(v-for="item in footer_data" :key="item.logo")
              v-img(:src="logo_path(item.logo)" height="60" contain)
</template>

<script>

import {static_file_path} from "~/lib/util";
import {NO_DOMAIN} from "~/lib/consts";

const pkg = require('../../package.json')

export default {
  name: "FooterContent",
  data() {
    return {
      version: pkg.version,
      privacy: {
        title: 'Privacy Policy'
      }
      // todo, should come from the server
    }
  },
  methods: {
    logo_path(path) {
      return static_file_path(this.$store, path)
    }
  },
  computed: {
    footer_data() {
      const no_domain_logos = this.$_.cloneDeep(this.$_.get(this.$store.getters["domain/get_domain_default_lang_data"](NO_DOMAIN),
        "footer_logos"))
      no_domain_logos.forEach(i => {
        i.logo = this.$api.static.url(`assets/domains/${NO_DOMAIN}/${i.logo}`)
      })
      return no_domain_logos
    }
  }
}

</script>


