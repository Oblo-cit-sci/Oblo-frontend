<template lang="pug">
  div
    v-btn(:href="inat_link") login with i nat
    v-btn(:href="orcid_link") login with orchid
    div {{is_pwa}}
    Aspect(mode="view" :aspect="u" :ext_value="orcid_u")
    Aspect(mode="edit" :aspect="u" :ext_value.sync="enter_v")
    Aspect(mode="view" :aspect="u" :ext_value.sync="enter_v")
</template>

<script>


import Aspect from "~/components/Aspect"
import {pack_value, unpack} from "~/lib/aspect";
import MessageTranslationBlock from "~/components/language/MessageTranslationBlock";
import {TREEMULTISELECT} from "~/lib/consts";
import ExternalAccountAspect from "~/components/aspects/ExternalAccountAspect";

export default {
  name: "Tests",
  mixins: [],
  components: {
    ExternalAccountAspect,
    MessageTranslationBlock,
    Aspect
  },
  created() {
    // console.log(this.$api.axios.baseURL)
    this.$api.actor.login({user_query: "admin", password: "admin123"}).then(res => {
      // console.log(res)
      this.$api.actor.get_me().then(res => {
      }, err => {
        console.error(err)
      })
    })
  },
  data() {
    return {
      u: {
        name:"orcid",
        label:"ORCiD",
        description:"Enter your ORCiD",
        type:"external_account",
        attr: {
          service: "orcid"
        }
      },
      orcid_u: pack_value("0000-0001-8510-5845"),
      enter_v: pack_value(),
      value: pack_value([]),
      aspect: {
        name: "tree",
        attr: {
          independent: true,
          allow_select_levels: [3, 4]
        },
        type: TREEMULTISELECT,
        items: "general_licci_tree"
      }
    }

  },
  computed: {
    is_pwa() {
      return window.navigator.standalone === true
    },
    inat_link() {
      // inat_init_redirect
      // console.log("inat")
      const client_id = "c1a4ab23afe83f7b1788548ead3ebe65a6a2991e66372ab70ce77ded41d9ce6a"
      const redirect_uri = "https://staging.opentek.eu/oauth_complete"
      const response_type = "code"
      const base_url = "https://inaturalist.org/oauth/authorize"
      const state = "abcdefghijkl"
      return `${base_url}?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&state=${state}`
      // return new Location({path: base_url, query: {client_id, redirect_uri, response_type}})
    },
    orcid_link() {
      return this.$api.basic.url_init_oauth("orcid")
    }
  },
  methods: {
    inat() {
      this.$router.push()
    },
    async orchid_link() {
      try {
        const result = await this.$api.basic.init_oauth("orchid")
        window.location.href=result.data
      } catch (e) {
        console.log(e)
      }
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
