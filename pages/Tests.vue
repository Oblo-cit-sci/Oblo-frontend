<template lang="pug">
  div
    v-treeview(:items="testtree" selectable v-model="selected")
    div {{selected}}
</template>

<script>

  import TriggerSnackbarMixin from "~/components/TriggerSnackbarMixin"

  export default {
    name: "Tests",
    mixins: [TriggerSnackbarMixin],
    components: {},
    created() {
    },
    data() {
      return {
        selected: [],
        testtree: [
          {
            "name": "A",
            id: 1,
            "children": [
              {
                "name": "A1",
                id: 3
              },
              {
                "name": "A2",
                id: 4
              }
            ]
          },
          {
            "name": "B",
            "id": 2,
            children: [
              {
                "name": "B",
                id: 5
              }
            ]
          }
        ]
      }
    },
    computed: {},
    methods: {
      trigger() {
        this.ok_snackbar("COOL")
      }
    }
  }
</script>

<style scoped>

</style>
