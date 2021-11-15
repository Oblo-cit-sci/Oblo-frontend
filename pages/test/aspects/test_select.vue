<template lang="pug">
  div
    Aspect(:aspect="aspect1" :ext_value.sync="value1" mode="edit")
    div
      span(v-text="value1")
</template>

<script>
import Aspect from "~/components/Aspect"
import {packed_aspect_default_value} from "~/lib/aspect"
import {SELECT} from "~/lib/consts"

export default {
  name: "test_select",
  mixins: [],
  components: {Aspect},
  props: {},
  data() {
    const aspect1 = {
      name: "select",
      type: SELECT,
      items: [
        {
          text: "Item 1",
          value: "1"
        },
        {
          text: "Item 2",
          value: "2"
        }, {
          text: "Item 3",
          value: "3"
        }
      ],
    }
    return {
      aspect1,
      value1: packed_aspect_default_value(aspect1)
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
