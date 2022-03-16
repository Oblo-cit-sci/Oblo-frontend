<template lang="pug">
  div
    v-icon.mr-1.mb-1(v-if="icon_part") {{icon_part}}
    component(:is="header_type" :style="{display:'inline'}") {{_title}}
      span(v-if="disabled") &nbsp;({{disabled_text}})
      slot
    div(v-if="multiple_descriptions")
      div(v-for="(description_part, index) in description" :key="index")
        div(v-if="index===0") {{description_part}}
        div(v-else class="secondary_descr") {{description_part}}
    div(v-else)
      div(v-if="description_as_html")
        div(v-html="first_description")
      div.pb-1(v-else)
        span {{first_description}}
</template>

<script>
import {VIEW} from "~/lib/consts";

/*
  put 2 times behind the header component
  v-icon.ml-1(small) mdi-feature-search-outline
 */

export default {
  name: "Title_Description",
  props: {
    t_title: {
      type: String,
    },
    title: {
      type: String,
      default: ""
    },
    icon: {
      type: String
    },
    header_type: {
      type: String,
      default: "h3"
    },
    t_description: {
      type: [String, Array]
    },
    description: {
      type: [String, Array],
      default: ""
    },
    description_as_html: {
      type: Boolean
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
    _title() {
      if (this.t_title) {
        return this.$t(this.t_title)
      }
      return this.title
    },
    icon_part() {
      return this.icon
    },
    _description() {
      if (this.t_description) {
        return this.$t(this.t_description)
      }
      return this.description
    },
    multiple_descriptions() {
      return Array.isArray(this.t_description || "") ||
        Array.isArray(this.description || "")
    },
    first_description() {
      if (this.multiple_descriptions) {
        if (this.t_description) {
          return this.$t(this.t_description[0])
        } else {
          return this.description[0]
        }
      } else
        return this._description
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
