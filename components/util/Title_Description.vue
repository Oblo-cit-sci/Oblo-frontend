<template lang="pug">
  div(v-if="!readOnly")
    component(:is="header_type") {{title}}
      span(v-if="disabled") &nbsp;({{disabled_text}})
    div(v-if="multiple_descriptions && !readOnly")
      div(v-for="(description_part, index) in description" :key="index")
        div(v-if="index===0") {{description_part}}
        div(v-else class="secondary_descr") {{description_part}}
    div(v-else)
      div(v-if="description_as_html")
        div(v-html="first_description")
      div(v-else class="pb-1") {{first_description}}
    div(v-if="note && !readOnly")
      div(:class="note.note_class") {{note.text}}
  div(v-else)
    component(:is="header_type") {{title}}
</template>

<script>
  import {VIEW} from "../../lib/consts";

  /*
    put 2 times behind the header component
    v-icon.ml-1(small) mdi-feature-search-outline
   */

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
      description_as_html: {
        type: Boolean
      },
      note: {
        type: Object
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
      }
    },
    computed: {
      multiple_descriptions() {
        return (this.description || "").constructor === Array
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

  .note {
    color: #1da1f2;
  }
</style>
