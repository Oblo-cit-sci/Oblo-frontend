<template lang="pug">
  div
    AspectSet(:aspects="aspects" mode="edit" :values.sync="values")
    div {{values}}
    v-btn.appear(fab color="red" :style="{'transform': 'scale(0)'}")
    Dialog(:dialog_open="true")
      v-sheet
        div cool
</template>

<script>


import AspectSet from "~/components/AspectSet"
import Dialog from "~/components/global/Dialog";

export default {
  name: "Tests",
  mixins: [],
  components: {
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
      values: {A: {value:"d"}}
    }
  },
  computed: {},
  methods: {},
  watch: {}
}
</script>

<style scoped>
  .appear {
    transition: 1s;
    transition-timing-function: cubic-bezier(.59,1.49,.84,2.01);
    transform: scale(2);
  }
</style>
