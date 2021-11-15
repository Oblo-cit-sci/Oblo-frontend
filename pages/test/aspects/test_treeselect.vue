<template lang="pug">
  div
    Aspect(:aspect="aspect" mode="edit" :ext_value.sync="value")
    Aspect(:aspect="aspect2" mode="edit" :ext_value.sync="value2")
</template>

<script>
import Aspect from "~/components/Aspect"
import {aspect_default_value} from "~/lib/aspect"

export default {
  name: "test_treeselect",
  mixins: [],
  components: {Aspect},
  props: {},
  data() {
    const aspect = {
      name: "tree",
      type: "tree",
      attr: {
        allow_select_levels: [2]
      },
      items: {
        levels: [
          {
            value: "l1",
            text: "Level 1"
          },
          {
            value: "l2",
            text: "Level 2"
          }
        ],
        root: {
          value: "root",
          children: [
            {
              value: "r1",
              text: "R1",
              children: [
                {
                  value: "r1-1",
                  text: "r1-1"
                },
                {
                  value: "r1-2",
                  text: "r2-2"
                }
              ]
            },
            {
              value: "r2",
              text: "R2",
              children: [
                {
                  value: "r2-1",
                  text: "r2-1"
                },
                {
                  value: "r2-2",
                  text: "r2-2"
                }
              ]
            }
          ]
        }
      }
    }
    const aspect2 = {
      name: "tree",
      type: "tree",
      attr: {
        allow_select_levels: [2]
      },
      items: "climatic_zones"
    }
    return {
      aspect,
        aspect2,
      value: aspect_default_value(aspect),
      value2: aspect_default_value(aspect2)
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
