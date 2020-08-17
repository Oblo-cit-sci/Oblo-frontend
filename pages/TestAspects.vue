<template lang="pug">
  div
    Aspect(v-for="a in aspects" :key="a.name" :aspect="a" :mode="mode" :ext_value.sync="values[a.name]")
    div
      div {{values}}
    Aspect(v-for="(a,index) in aspects" :key="index" :aspect="a" mode="view" :ext_value="values[a.name]")
</template>

<script>
import Aspect from "~/components/Aspect"
import {EDIT, STR, SELECT, INT, FLOAT, MULTISELECT, DATE, TREE, LOCATION, LIST, COMPOSITE} from "~/lib/consts"
import {aspect_default_value} from "~/lib/aspect"

export default {
  name: "TestAspects",
  mixins: [],
  components: {Aspect},
  props: {},
  data() {
    const aspects = [
      {
        name: "text-short",
        type: STR,
        attr: {
          max: 90
        }
      },
      {
        name: "text-long",
        type: STR,
        attr: {}
      },
      {
        name: SELECT,
        type: SELECT,
        attr: {},
        items: ["cool", "notcool"]
      },
      {
        name: INT,
        type: INT,
        attr: {}
      },
      {
        name: FLOAT,
        type: FLOAT,
        attr: {}
      },
      {
        name: MULTISELECT,
        type: MULTISELECT,
        attr: {},
        items: ["cool", "notcool", "both", "neither"]
      },
      {
        name: DATE,
        type: DATE,
        attr: {}
      },
      {
        name: TREE,
        type: TREE,
        attr: {},
        items: {
          levels: ["1", "2"],
          root: {
            name: "root",
            children: [
              {
                name: "a",
                children: [
                  {
                    name: "aa"
                  },
                  {
                    name: "ab"
                  }
                ]
              },
              {
                name: "b"
              }
            ]
          }
        }
      },
      {
        name: LOCATION,
        type: LOCATION,
        attr: {}
      },
      {
        name: LIST,
        type: LIST,
        attr: {},
        items: {
          name: "list-select",
          type: SELECT,
          attr: {},
          items: ["cool", "notcool"]
        }
      },
      // {
      //   name: COMPOSITE,
      //   type: COMPOSITE,
      //   attr: {},
      //   components: [
      //     {
      //       name: SELECT,
      //       type: SELECT,
      //       attr: {},
      //       items: ["cool", "notcool"]
      //     },
      //     {
      //       name: INT,
      //       type: INT,
      //       attr: {}
      //     }
      //   ]
      // }
    ]
    const set_vals =
      {
        "text-short": {"value": "dsdad"},
        "text-long": {"value": "sasas"},
        "select": {"value": "cool"},
        "int": {"value": "323"},
        "float": {"value": "32323"},
        "multiselect": {"value": ["cool"]},
        "date": {"value": "2020-08-07"},
        "tree": {"value": [{"value": "a", "text": "a"}]},
        "location": {"value": null},
        "list": {"value": [{"value": "notcool"}]}
      }
    return {
      mode: EDIT,
      aspects,
      values: set_vals // this.$_.mapValues(this.$_.keyBy(aspects, "name"), a => aspect_default_value(a))
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
