<template lang="pug">
  div
    AspectSet(:aspects="aspects" mode="edit" :values.sync="values")
    div {{values}}
</template>

<script>



import AspectSet from "~/components/AspectSet"

export default {
  name: "Tests",
  mixins: [],
  components: {
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

</style>
