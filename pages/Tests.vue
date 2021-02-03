<template lang="pug">
  div
    Aspect(:aspect="aspect" mode="edit" :ext_value.sync="value")
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

  },
  data() {
    return {
      value: pack_value([]),
      aspect: {
        name:"tree",
        attr: {
          independent: true,
          allow_select_levels: [3,4]
        },
        type: TREEMULTISELECT,
        items: "general_licci_tree"
      }
    }

  },
  computed: {},
  methods: {},
  watch: {}
}
</script>

<style scoped>

</style>
