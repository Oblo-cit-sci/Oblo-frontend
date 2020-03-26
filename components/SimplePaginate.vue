<template lang="pug">
  div
    v-btn(:disabled="!_has_prev" @click="change_page(-1)" outlined color="blue") Back
    v-btn(:disabled="!_has_next" @click="change_page(1)" outlined color="blue" :loading="next_loading") Next
    div.ml-2(v-if="show_page_index")
      span page: {{page}} &nbsp;
      span(v-if="total_pages") / {{total_pages}}

</template>

<script>
  export default {
    name: "SimplePaginate",
    mixins: [],
    components: {},
    props: {
      value: Number,
      total_pages: Number,
      has_next: Boolean,
      next_loading: Boolean,
      show_page_index: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {}
    },
    created() {
      if (this.total_pages === undefined && this.has_next === undefined) {
        console.log("SimplagePaginate error. Either total_pages or has_next must be specified")
      }
    },
    computed: {
      page() {
        return this.value
      },
      _has_next() {
        if (this.total_pages) {
          return this.page < this.total_pages
        } else {
          return this.has_next
        }
      },
      _has_prev() {
        return this.page > 1
      }
    },
    methods: {
      change_page(dir) {
        this.$emit('input', this.page + dir)
      }
    },
    watch: {}
  }
</script>

<style scoped>

</style>
