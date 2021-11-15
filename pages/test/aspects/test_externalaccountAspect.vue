<template lang="pug">
  div
    Aspect(:aspect="aspect" :ext_value.sync="value" mode="edit")
    Aspect(:aspect="aspect" :ext_value.sync="value2" mode="view")
</template>

<script>
import Aspect from "~/components/Aspect"
import {pack_value} from "~/lib/aspect"
export default {
  name: "test_externalaccountAspect",
  mixins: [],
  components: {Aspect},
  props: {},
  data() {
    return {
      aspect: {
        name: "test_aspect",
        label: "test_orcid_account",
        type: "external_account",
        attr: {
          service : "orcid"
        }
      },
      value: pack_value(),
      value2: pack_value("0000-0001-8510-5845")
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
