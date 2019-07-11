<template lang="pug">
  div
    Title_Description(header_type="h4" title="Navigate")
    v-btn(:disabled="has_prev_pages" @click="change_page(-1)") Previous Page
    v-btn(:disabled="last_page" @click="change_page(1)") Next Page
    span {{page + 1}} / {{total}}
    div(v-if="allow_jump")
      SingleSelect(
        :options="pages_options"
        :selection="selected_page"
        :only_value="true"
        :select_sync="false"
        v-on:selection="page_selected($event)")
</template>

<script>
  import SingleSelect from "./SingleSelect";
  import {string_list2options} from "../lib/client";
  import Title_Description from "./Title_Description";
  export default {
    name: "Paginate",
    components: {Title_Description, SingleSelect},
    props: {
      total: Number,
      page: Number,
      pages: {
        type: Array,
        required: false
      },
      allow_jump: {
        type: Boolean,
        default: true
      }
    },
    computed: {
      last_page() {
        return this.test_last_page(this.page)
      },
      has_prev_pages() {
        return !(this.page > 0)
      },
      pages_options() {
        return string_list2options(this.$_.map(this.pages, (p) => {return p.title}))
      },
      selected_page() {
        return this.pages[this.page].title
      }
    },
    methods: {
      test_last_page(test_page) {
        return test_page === this.total - 1
      },
      change_page(dir) {
        //console.log("pagechange", dir)
        const next_page = this.page + dir
        this.$emit("update:page", next_page)
        if(this.test_last_page(this.page) !== this.test_last_page(next_page))
          this.$emit("lastpage", this.test_last_page(next_page))
      },
      page_selected(page_title) {
        // todo, this triggers when page opened. should be just be set and be silent untill ui
        //console.log("page_selected", page_title)
        let page_select = this.$_.findIndex(this.pages, p => p.title === page_title)
        this.$emit("update:page", page_select)
        this.$emit("lastpage",this.test_last_page(page_select))
      }
    }
  }
</script>

<style scoped>

</style>
