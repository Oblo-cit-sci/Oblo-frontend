<template lang="pug">
  v-footer.justify-content-center.custom-footer(
    elevation=4
    app)
    v-col(v-if="!this.$vuetify.breakpoint.sm && !this.$vuetify.breakpoint.xs")
      v-card(flat
      tile
      class="white text-center")
        v-card-text.pb-0.pt-0
          v-btn(v-for="item in footer_data"
            :key="item.logo" class="mx-4 white--text" :href="item.link" target="_blank" text small)
            v-img(:src="item.logo"  width="70" contain)
        v-card-text.privacy-policy
          a {{privacy.title}}
          span | v{{version}}
    v-col(v-if="this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.xs")
      v-card(flat
      tile
      class="white text-center")
        v-card-text.pb-0.pt-0
          v-carousel(height="100" hide-delimiters=true cycle=true)
            v-carousel-item(v-for="item in footer_data"
              :key="item.logo")
              v-img(:src="logo_path(item.logo)" height="60" contain)
        v-card-text.privacy-policy
          a {{privacy.title}}
</template>

<script>

    import {static_file_path} from "../lib/util";

    const pkg = require('../package')
    export default {
        name: "Footer",
        data() {
            return {
                version: pkg.version,
                privacy: {
                    title: 'Privacy Policy'
                },
                footer_data: [
                    {
                        logo: 'images/footer/uab-logo.png',
                        link: 'https://www.uab.cat/web/universitat-autonoma-de-barcelona-1345467954774.html'
                    },
                    {
                        logo: 'images/footer/logo-ICTA-acronim.png',
                        link: 'https://ictaweb.uab.cat/'
                    },
                    {
                        logo: 'images/footer/2018-LASEG-Logo.png',
                        link: 'http://icta.uab.cat/Etnoecologia/'
                    },
                    {
                        logo: 'images/footer/LOGO_ERC-FLAG_EU_small.jpg',
                        link: 'https://erc.europa.eu'
                    },
                    {
                        logo: 'images/footer/Logo_MdM.png',
                        link: 'https://ictaweb.uab.cat/MdM.php'
                    }, {
                        logo: "images/footer/logo_economia.png"
                    }, {
                        logo: "images/footer/EOValue.jpg",
                        link: "https://ec.europa.eu/jrc/communities/en/community/eovalue"
                    },
                    {
                        logo: "images/footer/EC-JRC-logo_vertical_EN_pos_RGB.jpg",
                        link: "https://ec.europa.eu/jrc/en"
                    }
                ]
            }
        },
        methods: {
            logo_path(path) {
                return static_file_path(this.$store, path)
            }
        }
    }
</script>

<style scoped>
  .custom-footer {
    border-top: 1px solid lightgray;
    background-color: white;
    color: black;
  }

  .privacy-policy {
    font-size: 12px;
    padding-top: 8px;
    padding-bottom: 0px;
  }
</style>
