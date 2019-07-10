<template lang="pug">
  div
    component(v-bind:is="header_type" v-bind:class="{ disabled: disabled }") {{title}}
      span(v-if="disabled") &nbsp;(disabled)
    div(v-if="multiple_descriptions && !readOnly")
      div(v-for="(description_part, index) in description" :key="index")
          div(v-if="index===0") {{description_part}}
          div(v-else class="secondary_descr") {{description_part}}
    div(v-else) {{first_description}}
    div.pb-1
</template>

<script>
  import {VIEW} from "../lib/consts";

  export default {
    name: "Title_Description",
    props: {
      title:
        {
          type: String,
          required: true,
          default: ""
        },
      header_type: {
        type: String,
        default: "h3"
      },
      description: {
        type: [String, Array],
        default: ""
      },
      disabled: {
        type: Boolean,
        default: false
      },
      mode: {
        type: String,
        default: VIEW
      }
    },
    computed: {
      multiple_descriptions() {
        return this.description.constructor === Array
      },
      readOnly() {
        return this.mode === VIEW
      },
      first_description() {
        if(this.multiple_descriptions)
          return this.description[0]
        else
          return this.description
      }
    }
  }
</script>

<style scoped>
  .secondary_descr {
    font-size: 85%;
    padding-left: 1%;
    padding-right: 5%;
  }

  .disabled {
    opacity: 0.4;
  }
</style>
