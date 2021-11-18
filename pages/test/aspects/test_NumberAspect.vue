<template lang="pug">
  div
    Aspect(:aspect="aspect1" :ext_value.sync="value1" mode="edit")
    Aspect(:aspect="aspect2" :ext_value.sync="value2" mode="edit")
    Aspect(:aspect="aspect2" :ext_value.sync="value2" mode="view")
</template>

<script>
import Aspect from "~/components/Aspect"
import {packed_aspect_default_value} from "~/lib/aspect"
export default {
  name: "test_NumberAspect",
  mixins: [],
  components: {Aspect},
  props: {},
  data() {
          const aspect1= {
        type:"int",
        name:"int"
      }
      const aspect2= {
        type:"int",
        name:"int",
        attr: {
          min:0,
          max:100
        }
      }
    return {
      aspect1,
      aspect2,
      value1: packed_aspect_default_value(aspect1),
      value2: packed_aspect_default_value(aspect2)
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
