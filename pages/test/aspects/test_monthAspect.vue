<template lang="pug">
  div
    h1 Edit
    Aspect(:aspect="aspect" mode="edit" :ext_value.sync="aspect_value")
    h2 View of the same
    Aspect(:aspect="aspect" mode="view" :ext_value.sync="aspect_value")
    h2 Edit, any time
    Aspect(:aspect="aspect2" mode="edit" :ext_value.sync="aspect2_value")
</template>

<script>
import {MONTH} from "~/lib/consts"
import Aspect from "~/components/Aspect"
import {packed_aspect_default_value} from "~/lib/aspect"

export default {
  name: "test_monthAspect",
  mixins: [],
  components: {Aspect},
  props: {},
  data() {
    const aspect = {
      name: "month",
      label: "Month",
      type: MONTH,
    }
    const aspect2 = this.$_.cloneDeep(aspect)
    aspect2.attr = {"until_now": false}
    console.log(aspect2)
    const aspect_value = packed_aspect_default_value(aspect)
    const aspect2_value = packed_aspect_default_value(aspect2)
    console.log(aspect_value)
    return {
      aspect,
      aspect2,
      aspect_value,
      aspect2_value
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
