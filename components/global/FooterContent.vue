<template lang="pug">
  v-row
    v-col(v-if="is_mdAndUp")
      v-card.white.text-center(flat tile)
        v-card-text.pb-0.pt-0
          v-btn.mx-4.white--text(v-for="item in footer_data"
            :key="item.logo" :href="item.link" target="_blank" text small)
            v-img(:src="item.logo"  width="70" contain)
    v-col.py-1(v-else)
      v-card.white.text-center(flat tile)
        v-card-text.pb-0.pt-0
          v-carousel(height="100%" hide-delimiters cycle :show-arrows="false")
            v-carousel-item(v-for="item in footer_data" :key="item.logo")
              a(:href="item.link" target="_blank")
                v-img(:src="item.logo" height="60" contain)
</template>

<script>

import {NO_DOMAIN} from "~/lib/consts";
import ResponsivenessMixin from "~/components/ResponsivenessMixin";

const pkg = require('../../package.json')

export default {
  name: "FooterContent",
  mixins: [ResponsivenessMixin],
  data() {
    return {
      version: pkg.version,
      privacy: {
        title: 'Privacy Policy'
      }
      // todo, should come from the server
    }
  },
  methods: {},
  computed: {
    footer_data() {
      console.log("footer", this.$store.getters["domain/get_any_lang_data"](NO_DOMAIN))
      const no_domain_logos = this.$_.cloneDeep(this.$_.get(this.$store.getters["domain/get_any_lang_data"](NO_DOMAIN),
        "footer_logos"))
      if (no_domain_logos) {
        no_domain_logos.forEach(i => {
          i.logo = this.$api.static.url(`assets/domains/${NO_DOMAIN}/${i.logo}`)
        })
        return no_domain_logos
      }
      console.warn("temp warning: no footer logos...")
      console.warn(this.$store.getters["domain/get_domain_default_lang_data"](NO_DOMAIN))
      return []
    }
  }
}

</script>


