<template lang="pug">
  div
    div {{is_pwa}}
    Aspect(mode="view" :aspect="u" :ext_value="orcid_u")
    Aspect(mode="edit" :aspect="u" :ext_value.sync="enter_v")
    Aspect(mode="view" :aspect="u" :ext_value.sync="enter_v")
    OAuthLoginButtonGroup
</template>

<script>


import Aspect from "~/components/Aspect"
import {pack_value, unpack} from "~/lib/aspect";
import MessageTranslationBlock from "~/components/language/MessageTranslationBlock";
import {TREEMULTISELECT} from "~/lib/consts";
import ExternalAccountAspect from "~/components/aspects/ExternalAccountAspect";
import OAuthLoginButtonGroup from "~/components/actor/OAuthLoginButtonGroup";

export default {
  name: "Tests",
  mixins: [],
  components: {
    OAuthLoginButtonGroup,
    ExternalAccountAspect,
    MessageTranslationBlock,
    Aspect
  },
  created() {
    // console.log(this.$api.axios.baseURL)
    this.$api.basic.oauth_services().then(res => {
      console.log(res.data)
      this.services = res.data
    })
  },
  data() {
    return {
      services: [],
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
  },
  methods: {

  },
  watch: {}
}
</script>

<style scoped>

</style>
