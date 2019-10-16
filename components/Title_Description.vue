<template lang="pug">
  div(v-if="!readOnly")
    component(:is="header_type") {{title}}
      span(v-if="disabled") &nbsp;({{disabled_text}})
    div(v-if="multiple_descriptions && !readOnly")
      div(v-for="(description_part, index) in description" :key="index")
        div(v-if="index===0") {{description_part}}
        div(v-else class="secondary_descr") {{description_part}}
    div(v-else class="pb-1") {{first_description}}
  div(v-else)
    component(v-if="!placeholder" :is="header_type") {{title}}
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
      disabled_text: {
        type: String,
        default: "disabled"
      },
      mode: {
        type: String,
        default: VIEW
      },
      placeholder: {
        type: Boolean,
        default: false
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
        if (this.multiple_descriptions)
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

</style>
