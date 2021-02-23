<template lang="pug">
  div
    //v-btn(:href="inat_link") login with i nat
</template>

<script>


import Aspect from "~/components/Aspect"
import {pack_value, unpack} from "~/lib/aspect";
import MessageTranslationBlock from "~/components/language/MessageTranslationBlock";
import {TREEMULTISELECT} from "~/lib/consts";

export default {
  name: "Tests",
  mixins: [],
  components: {
    MessageTranslationBlock,
    Aspect
  },
  created() {
    console.log(this.$api.axios.baseURL)
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
    inat_link() {
      inat_init_redirect
      // console.log("inat")
      // const client_id = "c1a4ab23afe83f7b1788548ead3ebe65a6a2991e66372ab70ce77ded41d9ce6a"
      // const redirect_uri = "https://staging.opentek.eu/oauth_complete"
      // const response_type = "code"
      // const base_url = "https://inaturalist.org/oauth/authorize"
      // const code = "abcdefghijkl"
      // return `${base_url}?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&code=${code}`
      // return new Location({path: base_url, query: {client_id, redirect_uri, response_type}})
    }
  },
  methods: {
    inat() {
      this.$router.push()
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
