<template lang="pug">
  div
    Aspect(:aspect="aspect" mode="edit" :ext_value.sync="value")
    div {{value}}
</template>

<script>
import Aspect from "~/components/Aspect"
import {pack_value} from "~/lib/aspect"

export default {
  name: "test_locationAspect",
  mixins: [],
  components: {Aspect},
  props: {},
  data() {
    return {
      aspect: {
        name: "location1",
        type: "location",
        attr: {
          "input": [
            "device",
            "map",
            "search"
          ]
        }
      },
      value: pack_value()
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
