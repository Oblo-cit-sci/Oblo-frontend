<template lang="pug">
  Aspect(:aspect="aspect" :ext_value="value" mode="edit" :conditionals="value")
</template>

<script>

import Aspect from "~/components/Aspect"
import {aspect_default_value} from "~/lib/aspect"

const aspect = {
  "name": "aspect",
  "label": "Aspect",
  "type": "composite",
  attr: {
    "add_components_as_conditionals": true
  },
  "components": [
    {
      "name": "name",
      "label": "Name",
      "description": "The name of the variable (internal name)",
      "type": "str",
      "attr": {
        "max": 90
      }
    },
    {
      "name": "label",
      "label": "Label",
      "description": "The visible label of the variable (public name)",
      "type": "str",
      "attr": {
        "max": 90
      }
    },
    {
      "name": "type",
      "label": "Type",
      "type": "select",
      "items": [
        {
          "value": "str",
          "text": "String",
        },
        {
          "value": "int",
          "text": "Integer"
        },
        {
          "value": "float",
          "text": "Floating point number"
        },
        {
          "value": "select",
          "text": "Select"
        },
        {
          "value": "multiselect",
          "text": "Mulit-select"
        },
        {
          "value": "tree",
          "text": "Tree-select"
        },
        {
          "value": "images",
          "text": "Images"
        },
        {
          "value": "location",
          "text": "Location"
        },
        {
          "value": "composite",
          "text": "Composite"
        },
        {
          "value": "list",
          "text": "List"
        }
      ]
    },
    {
      "name": "attributes",
      "label": "Attributes",
      "type": "composite",
      "components": [
        {
          "name": "min",
          "label": "min",
          "type": "int"
        },
        {
          "name": "max",
          "label": "max",
          "type": "int"
        },
      ]
    },
    {
      "name": "items",
      "label": "Items",
      "type": "list",
      attr: {
        // condition: {
        //   "aspect": "$value.type.value",
        //   "value": "select"
        // }
      },
      "list_items": {
        "name": "item",
        "label": "Item",
        "type": "composite",
        "components": [
          {
            "name": "value",
            "label": "Value",
            "type": "str",
            attr: {
              "max": 90
            }
          },
          {
            "name": "text",
            "label": "Text",
            "type": "str",
            attr: {
              "max": 90
            }
          },
          {
            "name": "description",
            "label": "Description",
            "type": "str",
            attr: {
              "max": 400
            }
          },
        ]
      }
    }
  ]
}



export default {
  name: "index",
  mixins: [],
  components: {Aspect},
  props: {},
  data() {
    return {
      aspect,
      value: aspect_default_value(aspect)
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
