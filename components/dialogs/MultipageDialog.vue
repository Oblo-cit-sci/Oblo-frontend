<template lang="pug">
  Dialog(:dialog_open.sync="dialog_open" persistent)
    v-sheet.pa-1(color="white")
      v-toolbar(flat)
        v-btn(icon @click="back()")
          v-icon {{back_icon}}
        v-toolbar-title
          span.font-weight-bold {{page_title}}
      v-btn(@click="next()" small outlined color="blue" :loading="next_loading") {{next_btn_text}}
</template>

<script>
import DialogMixin from "~/components/dialogs/DialogMixin"
import Dialog from "~/components/dialogs/Dialog"

export default {
  name: "MultipageDialog",
  mixins: [DialogMixin],
  components: {Dialog},
  props: {
    globals: {
      type: Object
    },
    act_page: {
      type: Number,
      default: 0
    },
    page_data: {
      type: Array,
      required: true
    },
    generated_data_template: {
      type: Object
    },
    finnish_action: {
      type: Function
    }
  },
  data() {
    return {
      act_generated_data: {},
      generated_data: {}
    }
  },
  created() {
    this.generated_data = this.$_.cloneDeep(this.generated_data_template)
  },
  computed: {
    num_pages() {
      return this.page_data.length
    },
    act_page_data() {
      return this.page_data[this.act_page]
    },
    page_title() {
      return this.page_data[this.act_page].title
    },
    back_icon() {
      if (this.act_page === 0) {
        return "mdi-close"
      } else {
        return "mdi-arrow-left"
      }
    },
    has_next() {
      return this.act_page < this.num_pages - 1
    },
    next_loading() {
      return false
    },
    next_btn_text() {
      if (this.has_next)
        return this.$t("comp.simple_paginate.next")
      else
        return "finnish"
    }
  },
  methods: {
    update_page(page_no) {
      this.$emit("update:act_page", page_no)
    },
    back() {
      if(this.act_page === 0) {
        this.$emit("cancel")
      } else {
        this.update_page(this.act_page - 1)
      }
    },
    next() {
      if (this.$_.get(this.globals, "next_action", null)) {
        this.globals.next_action(this.act_generated_data, this.generated_data, this.act_page_data)
      }
      if (this.act_page_data.next_action) {
        this.act_page_data.next_action(this.act_generated_data, this.generated_data, this.act_page_data)
      }
      if (this.has_next) {
        this.update_page(this.act_page + 1)
      } else {
        this.finnish_action(this.generated_data)
      }
    }
  }
}
</script>

<style scoped>

</style>
