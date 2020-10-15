<template lang="pug">
  div
    AspectSet(:aspects="aspects" mode="edit" :values.sync="values")
    div {{values}}
    Aspect(:aspect="multitest" mode="edit" :ext_value.sync="multitest.value")
</template>

<script>


import AspectSet from "~/components/AspectSet"
import Dialog from "~/components/global/Dialog";
import Aspect from "~/components/Aspect"

export default {
  name: "Tests",
  mixins: [],
  components: {
    Aspect,
    Dialog,
    AspectSet
  },
  created() {
  },
  data() {
    return {
      aspects: [
        {
          name: "A",
          type: "str",
          attr: {
            max: 90
          }
        },
        {
          name: "B",
          type: "int",
          attr: {
            min: 1,
            max: 100
          }
        },
        {
          name: "S",
          type: "select",
          attr: {},
          "items": ["a", "b"]
        },
        {
          name: "D",
          type: "str",
          attr: {
            max: 80,
            condition: {
              aspect: "# S",
              value: "a"
            },
            hide_on_disabled: true
          }
        }
      ],
      values: {A: {value: "d"}},
      multitest: {
        name: "m",
        type: "multiselect",
        attr: {},
        items: ["a", "b", { value: "xxx", condition: {exclude: ["a"]}}]
      },
      value: []
    }
  },
  computed: {},
  methods: {},
  watch: {}
}
</script>

<style scoped>

</style>
