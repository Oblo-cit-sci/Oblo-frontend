<template lang="pug">
  div
    AspectSet(:aspects="aspects" mode="edit" :values.sync="values")
    div {{values}}
    Aspect(:aspect="multitest" mode="edit" :ext_value.sync="multitest.value")
    MultipageDialog(:dialog_open="dialog_open"
      :page_data="page_data"
      :act_page.sync="page"
      :finnish_action="action"
      :globals="globals"
      :generated_data_template="generated_data_template"
      @cancel="cancel")
</template>

<script>


import AspectSet from "~/components/AspectSet"
import Dialog from "~/components/global/Dialog";
import Aspect from "~/components/Aspect"
import MultipageDialog from "~/components/dialogs/MultipageDialog"

export default {
  name: "Tests",
  mixins: [],
  components: {
    MultipageDialog,
    Aspect,
    Dialog,
    AspectSet
  },
  created() {
  },
  data() {
    return {
      dialog_open: true,
      cancel: () => {
        console.log("bye")
        this.dialog_open = false
      },
      action: (data) => {
        console.log(data)
      },
      page: 0,
      generated_data_template: {
        visited_pages: []
      },
      globals: {
        next_action: (_, data, self) => {
          data.visited_pages.push(self.title)
        }
      },
      page_data: [
        {
          title: "a"
        },
        {
          title: "b"
        }
      ],
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
        items: ["a", "b", {value: "xxx", condition: {exclude: ["a"]}}]
      },
      value: [],

    }
  },
  computed: {},
  methods: {},
  watch: {}
}
</script>

<style scoped>

</style>
