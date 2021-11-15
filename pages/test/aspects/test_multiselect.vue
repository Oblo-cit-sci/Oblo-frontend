<template lang="pug">
  div
    Aspect(:aspect="aspect1" :ext_value.sync="value1" mode="edit")
    div
      span(v-text="value1")
    Aspect(:aspect="aspect2" :ext_value.sync="value2" mode="edit")
    div
      span(v-text="value2")
    div
</template>

<script>
import Aspect from "~/components/Aspect"
import {MULTISELECT} from "~/lib/consts"
import {packed_aspect_default_value} from "~/lib/aspect"

export default {
  name: "test_multiselect",
  mixins: [],
  components: {Aspect},
  props: {},
  data() {
    const aspect1 = {
      name: "multiselect",
      type: MULTISELECT,
      items: [
        {
          text: "Item 1",
          value: "i1"
        },
        {
          text: "Item 2",
          value: "i2"
        }, {
          text: "Item 3",
          value: "i3"
        }
      ],
    }
    const aspect2 = this.$_.cloneDeep(aspect1)
    aspect2.attr = {
      force_view: "select"
    }
    return {
      aspect1,
      aspect2,
      value1: packed_aspect_default_value(aspect1),
      value2: packed_aspect_default_value(aspect2),
      value3: packed_aspect_default_value(aspect2)
    }
  },

  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
